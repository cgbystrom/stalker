import time
import functools
import base64
import json
import gevent
from cStringIO import StringIO
from gevent.local import local

class Stalker(object):
    def __init__(self, app):
        self.app = app

    def transform(self, data):
        return data.upper()

    def __call__(self, environ, start_response):
        trace.begin()

        sio = StringIO()
        _status = "200 OK"
        _response_headers = []
        _exc_info = None

        def _start_response(status, response_headers, exc_info=None):
            _status = status
            _response_headers = response_headers
            _exc_info = exc_info
            return sio.write

        iterable = None
        try:
            iterable = self.app(environ, _start_response)
        except BaseException, e:
            print "Exception in Stalker", e
            import traceback
            print traceback.format_exc()
        finally:
            body = {'traces': trace.get_calls()}
            encoded_body = base64.b64encode(json.dumps(body))
            _response_headers.append(('X-Stalker-Body', encoded_body))
            
            write = start_response(_status, _response_headers, _exc_info)
            if sio.tell(): # position is not 0
                sio.seek(0)
                write(sio.read())

            try:
                for data in iterable:
                    yield data
            finally:
                if hasattr(iterable, 'close'):
                    iterable.close()

class Trace(local):
    initialized = False
    
    def __init__(self, **kw):
        if self.initialized:
            raise SystemError('__init__ called too many times')

        self.initialized = True
        self.reset()

    def begin(self):
        self.request_started = self._time()

    def end(self):
        self.request_ended = self._time()

    def reset(self):
        self.calls = []

    def instrumented(self, func=None, name=None):
        if func is None:
            return functools.partial(self.instrumented, name=name)

        @functools.wraps(func)
        def with_instrumentation(*args, **kwargs):
            f_name = name if name else func.__name__
            start_time = self._time()
            result = func(*args, **kwargs)
            self.log_call(f_name, start_time, self._time())
            return result
        
        return with_instrumentation

    def log_call(self, name, start_time, end_time):
        self.calls.append((name, start_time, end_time))

    def get_calls(self):
        n = self.request_started
        sorted_calls = sorted(self.calls, key=lambda t: t[1])
        return [(name, start - n, end - n) for name, start, end in sorted_calls]

    def _time(self):
        return time.time() * 1000

trace = Trace()