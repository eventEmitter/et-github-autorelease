!function(){

	var   Class 			= require('ee-class')
		, log 				= require('ee-log')
		, project 			= require('ee-project')
		, Webservice 		= require('ee-webservice')
		, FormDataCollector = require('em-formdata-collector')
		, exec 				= require('child_process').exec;



	module.exports = new Class({

		repositories: {}

		, init: function() {
			this.initConfig();

			this.webservice = new Webservice(project.config);
			this.webservice.use(new FormDataCollector());
			this.webservice.use(this);
			this.webservice.listen();
		}


		, initConfig: function() {
			project.config.repositories.forEach(function(config){
				this.repositories[config.repository] = config;
			}.bind(this));
		}


		, request: function(request, response, next) {
			log(request.getHeaders());
			log(request.getUri());
			log(request.query);

			if (request.method === 'post') {
				request.getForm(function(data) {
					response.send(200);

					try {
						var data = JSON.parse(data.payload);
					} catch(e) {
						log(e);
						return; 
					}

					if (Object.prototype.hasOwnProperty.call(this.repositories, data.repository.name)){
						this.checkRelease(data, this.repositories[data.repository.name]);
					}
					else {
						log(data);
						log.debug('not.a.known.repository!');
					}
				}.bind(this));
			}
		}



		, checkRelease: function(data, config) {
			log(data.ref.substr(data.ref.lastIndexOf('/')+1), config.branch);
			if (data.ref.substr(data.ref.lastIndexOf('/')+1) === config.branch) {
				this.release(data, config);
			}
			else {
				log(data);
				log.debug('nothing.to.release!');
			}
		}


		, release: function(data, config) {
			// git pull
			exec('cd ' + config.path + ' && git pull', function(err, stdout, stderr) {
				if (err) {
					log(stdout, stderr, err);
				}
				else {
					if (config.service) this.restartService(config.service);
				}
			}.bind(this));
		}



		, restartService: function(service) {
			exec('stop ' + service + ' && start ' + service, function(err, stdout, stderr) {
				if (err) {
					log(stdout, stderr, err);
				}
				else {
					log.info('service was updated!');
				}
			}.bind(this));
		}
	});
}();
