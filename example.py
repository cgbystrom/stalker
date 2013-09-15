import gevent
from gevent.wsgi import WSGIServer
from flask import Flask, render_template, make_response
import random
import stalker
from stalker import trace

app = Flask(__name__)
app.debug = True

def do_heavy_lifting():
    get_user()
    get_profile()

@trace.instrumented()
def get_user():
    gevent.sleep(0.01)
    memcache_get()

@trace.instrumented()
def get_profile():
    get_user()
    get_friends()
    mysql_select()

@trace.instrumented()
def get_friends():
    for i in range(5):
        get_user()

@trace.instrumented()
def memcache_get():
    gevent.sleep(0.01)

@trace.instrumented()
def mysql_select():
    gevent.sleep(0.05)

def generate_random_trace():
    trace.request_started = 1379110581716
    names = [
        "memcached.get", "memcached.set", "memcached.multiget",
        "redis.hincrby", "redis.hmget", "redis.linsert", "redis.zinterstore",
        "mysql.select", "mysql.update", "mysql.insert",
        "s3.get", "s3.put"]

    offset = trace.request_started
    for i in range(1, random.randint(10, 100)):
        new_offset = random.randint(1, 50)
        if random.randint(1, 15) == 1:
            # parallel calls
            name = random.choice(names)
            trace.log_call(name, offset, offset + new_offset)
            trace.log_call(name, offset, offset + new_offset)
            trace.log_call(name, offset, offset + new_offset)
        else:
            # serial
            trace.log_call(random.choice(names), offset, offset + new_offset)

        offset += new_offset
        
    trace.request_ended = offset
    return trace.get_calls()

@app.route('/')
def index():
    return TEMPLATE

@app.route('/heavy')
def heavy():
    do_heavy_lifting()
    return "Heavy lifting done"

@app.route('/random')
def random_get():
    import json
    traces = generate_random_trace()
    return make_response((str(json.dumps(traces)), 200, {}))

TEMPLATE = """
<!DOCTYPE html>
<html>
<body>
    <h1>Stalker Test Page</h1>
    <button id="heavy">GET /heavy</button>
    <button id="random">GET /random</button>
    <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script type="text/javascript">
        $('button#heavy').click(function() { $.get('/heavy', function() {}); });
        $('button#random').click(function() { $.get('/random', function() {}); });
    </script>
</body>
</html> 
"""

if __name__ == "__main__":
    app = stalker.Stalker(app)
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()


