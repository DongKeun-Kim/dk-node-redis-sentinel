/**** 
 * node-redis options object properties
 * Property	Description (default)
 * host	 - IP address of the Redis server (127.0.0.1)	
 * port - Port of the Redis server (6379)
 * path - The UNIX socket string of the Redis server (null)
 * url - The URL of the Redis server. Format: [redis:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]] (More info avaliable at IANA).(null)
 * parser - If hiredis is not installed, automatic fallback to the built-in javascript parser (hiredis)
 * string_numbers - Set to true, node_redis will return Redis number values as Strings instead of javascript Numbers. Useful if you need to handle big numbers (above Number.MAX_SAFE_INTEGER === 2^53). Hiredis is incapable of this behavior, so setting this option to true will result in the built-in javascript parser being used no matter the value of the parser option. (null)
 * return_buffers - If set to true, then all replies will be sent to callbacks as Buffers instead of Strings. (false);
 * detect_buffers - If set to true, then replies will be sent to callbacks as Buffers. This option lets you switch between Buffers and Strings on a per-command basis, whereas return_buffers applies to every command on a client. Note: This doesn't work properly with the pubsub mode. A subscriber has to either always return Strings or Buffers. (false)
 * socket_keepalive - If set to true, the keep-alive functionality is enabled on the underlying socket. (true)
 * no_ready_check - When a connection is established to the Redis server, the server might still be loading the database from disk. While loading, the server will not respond to any commands. To work around this, node_redis has a "ready check" which sends the INFO command to the server. The response from the INFO command indicates whether the server is ready for more commands. When ready, node_redis emits a ready event. Setting no_ready_check to true will inhibit this check. (false)
 * enable_offline_queue - By default, if there is no active connection to the Redis server, commands are added to a queue and are executed once the connection has been established. Setting enable_offline_queue to false will disable this feature and the callback will be executed immediately with an error, or an error will be emitted if no callback is specified. (true)
 * retry_max_delay - By default, every time the client tries to connect and fails, the reconnection delay almost doubles. This delay normally grows infinitely, but setting retry_max_delay limits it to the maximum value provided in milliseconds. (null)
 * connect_timeout - Setting connect_timeout limits the total time for the client to connect and reconnect. The value is provided in milliseconds and is counted from the moment a new client is created or from the time the connection is lost. The last retry is going to happen exactly at the timeout time. Default is to try connecting until the default system socket timeout has been exceeded and to try reconnecting until 1h has elapsed. (3600000)
 * max_attempts - Deprecated Please use retry_strategy instead. By default, a client will try reconnecting until connected. Setting max_attempts limits total amount of connection attempts. Setting this to 1 will prevent any reconnect attempt. (0)
 * retry_unfulfilled_commands - If set to true, all commands that were unfulfilled while the connection is lost will be retried after the connection has been reestablished. Use this with caution if you use state altering commands (e.g. incr). This is especially useful if you use blocking commands. (false)
 * password - If set, client will run Redis auth command on connect. Alias auth_pass Note node_redis < 2.5 must use auth_pass (null)
 * db - If set, client will run Redis select command on connect. (null)
 * family - You can force using IPv6 if you set the family to 'IPv6'. See Node.js net or dns modules on how to use the family type. (IPv4)
 * disable_resubscribing - If set to true, a client won't resubscribe after disconnecting. (false)
 * rename_commands - Passing an object with renamed commands to use instead of the original functions. See the Redis security topics for more info. (null)
 * tls - An object containing options to pass to tls.connect to set up a TLS connection to Redis (if, for example, it is set up to be accessible via a tunnel). (null)
 * prefix - A string used to prefix all used keys (e.g. namespace:test). Please be aware that the keys command will not be prefixed. The keys command has a "pattern" as argument and no key and it would be impossible to determine the existing keys in Redis if this would be prefixed. (null)
 * retry_strategy - A function that receives an options object as parameter including the retry attempt, the total_retry_time indicating how much time passed since the last time connected, the error why the connection was lost and the number of times_connected in total. If you return a number from this function, the retry will happen exactly after that time in milliseconds. If you return a non-number, no further retry will happen and all offline commands are flushed with errors. Return an error to return that specific error to all offline commands. Example below. (function)
 */
var sentinel = require("redis-sentinel");

var _options = {};
var _sentinel = null;

var initOptions = (options, role) => {
	if (!role) {
		 role = 'master'
	}
	
	if (!options) {
		options = {};
		
		if (!options.dbIdx) {
			options.db = 0;
		}
		
		if (!options.role) {
			options.role = role;
		}
	}
	
	for (var opt in _options.redis) {
		options[opt] = _options.redis[opt]; 
	}
	
	return options;
};

module.exports.config = options => {
	if (options) {
		_options = options;
	}
	
	_sentinel = sentinel.Sentinel(_options.endpoints);
}

var getClient = module.exports.getClient = function(param1, param2, param3) {
	var role = null,
		redisCb = null,
		opts = null,
		options = null,
		redisClient = null,
		idx = 0;
	
	for (; idx < arguments.length ; idx++) {
		if (typeof arguments[idx] === "string") {
			role = arguments[idx];
		} 
		else if (typeof arguments[idx] === 'function') {
			redisCb = arguments[idx];
		} 
		else if (typeof arguments[idx] === 'object') {
			opts = arguments[idx];
		}
	}
	
	try {
		options = initOptions(opts, role);
		
		redisClient = _sentinel.createClient(_options.masterName, options);
		
		if (options.auth_pass) {
			redisClient.auth(options.auth_pass);
		}
	} catch (e) {
		redisCb(e);
	}
	
	redisCb(null, redisClient);
};

/**
 * @param
 * key
 * redisCb
 * opts
 */
module.exports.get = (key, redisCb, opts) => {
	getClient('master', opts, function(err, redisClient) {
		if (err && err !== "OK") {
			return redisCb(err);
		}
		
		redisClient.get(key, function(err, reply){
			redisClient.quit();
			redisCb(null, reply);
		});
	});
	
};

/**
 * Redis set
 * @param {String} key 
 * @param {Object} data 
 */

/**
 * Redis set
 * @param {String} key 
 * @param {String} data 
 * @param {Function} callback 
 */

/**
 * Redis set
 * @param {String} key 
 * @param {String} data 
 * @param {Function} callback 
 * @param {Object} redisOptions 
 */

/**
 * Redis set
 * @param {String} key 
 * @param {Object} data 
 * @param {Number} expireSeconds 
 * @param {Object} redisOptions 
 */

/**
 * Redis set
 * @param {String} key 
 * @param {Object} data 
 * @param {Number} expireSeconds 
 * @param {Function} callback 
 */
/**
 * Redis set
 * @param {String} key 
 * @param {Object} data 
 * @param {Number} expireSeconds 
 * @param {Function} callback 
 * @param {Object} redisOptions 
 */
module.exports.set = function(key, data, param1, param2, param3){
	var ex = 0,
		redisCb = null,
		opts = null
		redisConnect = null,
		options = initOptions(opts),
		idx = 2;
	
	console.log("%% redis-set [" + key +"]");
	
	if (typeof data === "object") {
		data = JSON.stringify(data);
	}
	
	for (; idx < arguments.length ; idx++) {
		if (typeof arguments[idx] === "number") {
			ex = arguments[idx];
		} 
		else if (typeof arguments[idx] === 'function') {
			redisCb = arguments[idx];
		} 
		else if (typeof arguments[idx] === 'object') {
			opts = arguments[idx];
		}
	}
	
	getClient('master', opts, function(err, redisClient) {
		if (err) {
			return redis(err);
		}
		
		redisClient.set(key, data, function(err, res){
			redisClient.quit();
			
			if (err && res !== "OK") {
				if (redisCb) {
					return redis(err);
				}
				
				throw err;;
			}
			
			if(ex){
				redisClient.expire(key, ex);
			}
			
			if (redisCb) {
				redisCb(err);
			}
		});
	});
};