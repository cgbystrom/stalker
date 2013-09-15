_.mixin(_.str.exports());
App = Ember.Application.create();
var requestIdCounter = 1;
var headerName = "X-Stalker-Body";

var bglog = function(obj) {
  if(chrome && chrome.runtime) {
    chrome.runtime.sendMessage({type: "bglog", obj: obj});
  }
}

var setObj = function(name, obj) {
  if(chrome && chrome.runtime) {
    chrome.runtime.sendMessage({type: "setObj", name: name, obj: obj});
  }
}

if (chrome && chrome.devtools) {
  chrome.devtools.network.onRequestFinished.addListener(function(request) {
    //bglog("Received request")
    //bglog(request)
    
    var stalkerResponse = _.find(request.response.headers, function(h) { return h.name == headerName; });
    
    if (stalkerResponse) {
      var traces = JSON.parse(atob(stalkerResponse.value));
      App.requests.unshiftObject(App.Request.create({request: request, traces: traces.traces}));
    } else {
      var n = parseInt(App.requestInfo.get('numFiltered'));
      App.requestInfo.set('numFiltered', ++n);
    }
  });
}

App.Request = Ember.Object.extend({
  init: function() {
    this.set('id', requestIdCounter++);
  },

  url: function() {
    var url = this.get('request.request.url').replace('http://', '');
    if (url.indexOf('/') == -1)
      url += '/'
    return url;
  },

  name: function() {
    return this.url().substr(this.url().lastIndexOf('/'));
  }.property('request.request.url'),

  path: function() {
    return this.url().substr(0, this.url().lastIndexOf('/'));
  }.property('request.request.url'),

  tracesAsObj: function() {
    return this.get('traces').map(function(t) { return App.Trace.create({trace: t}); });
  }.property('traces')
});

App.Trace = Ember.Object.extend({
  init: function(rawTrace) {
    var t = this.get('trace');
    this.set('name', t.objectAt(0));
    this.set('startTime', t.objectAt(1));
    this.set('endTime', t.objectAt(2));
  },
  
  duration: function() {
    return this.get('endTime') - this.get('startTime');
  }.property('startTime', 'endTime'),

  style: function() {
    return "width: %@px; margin-left: %@px;".fmt(this.get('duration'), this.get('startTime'));
  }.property('startTime', 'endTime')
})

App.requestInfo = Ember.Object.create();
App.requestInfo.set('numFiltered', 0);
App.requests = Ember.A([]);

App.Router.map(function() {
    this.resource('requests');
    this.resource('request', {path: '/requests/:request_id'});
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('requests');
  }
});

App.ApplicationRoute = Ember.Route.extend({
    renderTemplate: function() {
        this.render();
        this.render("request-list", {
            outlet: "request-list",
            into: "application"
        });
    }
});

App.RequestRoute = Ember.Route.extend({
  renderTemplate: function() {
    this.render('request/index');
  },
  
  model: function(params) {
    var request = App.requests.find(function(r) {
      return r.id == parseInt(params.request_id)
    });

    if (!request) {
      this.transitionTo('requests');
    }

    return request;
  }
});

App.ApplicationController = Ember.Controller.extend({
  firstName: "Charlie",
  init: function() {
    this.set('requests', App.requests);
    this.set('requestInfo', App.requestInfo);
  }
});


Handlebars.registerHelper('duration', function() {
  var decimals = this.get('duration') >= 10 ? 0 : 1;
  return _.numberFormat(this.get('duration'), decimals, '.', ',')
});
