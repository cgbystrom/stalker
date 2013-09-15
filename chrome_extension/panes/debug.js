var fixture = {"traces": [["mysql.insert", 0, 21], ["memcached.set", 21, 43], ["memcached.get", 43, 87], ["redis.linsert", 87, 114], ["redis.zinterstore", 114, 117], ["mysql.select", 117, 145], ["memcached.multiget", 117, 145], ["s3.put", 117, 145], ["s3.put", 145, 184], ["memcached.set", 184, 212], ["redis.zinterstore", 212, 261], ["mysql.update", 261, 264], ["memcached.get", 264, 311], ["memcached.get", 264, 311], ["redis.linsert", 264, 311], ["redis.zinterstore", 311, 349], ["memcached.set", 349, 391], ["mysql.update", 349, 391], ["mysql.select", 349, 391], ["redis.zinterstore", 391, 405], ["s3.put", 405, 424], ["mysql.select", 405, 424], ["mysql.update", 405, 424], ["s3.put", 424, 461], ["redis.hincrby", 461, 482], ["memcached.set", 482, 493], ["mysql.insert", 482, 493], ["mysql.select", 482, 493], ["mysql.update", 493, 510], ["mysql.update", 510, 550], ["memcached.multiget", 550, 561], ["s3.put", 561, 583], ["redis.linsert", 583, 585], ["s3.get", 585, 627], ["redis.zinterstore", 585, 627], ["redis.hincrby", 585, 627], ["mysql.select", 627, 650], ["redis.linsert", 650, 673], ["memcached.multiget", 673, 680], ["mysql.insert", 680, 716], ["s3.put", 716, 752], ["s3.put", 752, 757], ["s3.get", 757, 761], ["s3.put", 761, 793], ["redis.hmget", 761, 793], ["memcached.get", 761, 793], ["memcached.set", 793, 838], ["redis.linsert", 838, 856], ["mysql.insert", 856, 865], ["s3.get", 865, 878], ["redis.hincrby", 878, 889], ["redis.hmget", 889, 925], ["redis.linsert", 925, 928], ["s3.get", 928, 958], ["s3.put", 928, 958], ["mysql.insert", 928, 958], ["redis.zinterstore", 958, 963], ["mysql.select", 963, 1011], ["memcached.set", 1011, 1016], ["redis.hincrby", 1016, 1032], ["redis.hincrby", 1016, 1032], ["mysql.update", 1016, 1032]]}
var request = {
  request: {
    method: "GET",
    url: "http://www.google.com/api/testing?query=23423&parameter=4243#dfsdfsd"
  }
}
App.requests.unshiftObject(App.Request.create({request: request, traces: fixture.traces}));