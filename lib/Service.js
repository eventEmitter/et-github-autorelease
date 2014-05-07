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
				if (!this.repositories[config.repository]) this.repositories[config.repository] = [];
				this.repositories[config.repository].push(config);
			}.bind(this));
		}


		, request: function(request, response, next) {
			if (request.method === 'post') {
				request.getForm(function(data) {
					response.send(200);

					try {
						var data = JSON.parse(data.payload);
					} catch(e) {
						log(e);
						return;
					}

					log.info('update for repository: '+data.repository.name);

					if (Object.prototype.hasOwnProperty.call(this.repositories, data.repository.name) && this.repositories[data.repository.name].length){
						this.repositories[data.repository.name].forEach(function(config){
							this.checkRelease(data, config);
						}.bind(this));						
					}
					else {
						log(data);
						log.debug('not.a.known.repository!');
					}
				}.bind(this));
			}
			else response.send(200);
		}



		, checkRelease: function(data, config) {
			log.debug('branch: '+data.ref.substr(data.ref.lastIndexOf('/')+1));

			if (data.ref.substr(data.ref.lastIndexOf('/')+1).toLowerCase().trim() === config.branch.toLowerCase().trim()) {
				this.release(data, config);
			}
			else {
				log(data);
				log.debug('nothing.to.release!');
			}
		}


		, release: function(data, config) {
			log('git pull ...');

			// git pull
			exec('cd ' + config.path + ' && git pull', function(err, stdout, stderr) {
				if (err) {
					log(stdout, stderr, err);
				}
				else {
					log('done');
					if (config.service) this.restartService(config.service);
				}
			}.bind(this));
		}



		, restartService: function(service) {
			log('restarting service ....');

			exec('stop ' + service + ' && start ' + service, function(err, stdout, stderr) {
				if (err) {
					log(stdout, stderr, err);
				}
				else {
					log('done');
					log.info('service was updated!');
				}
			}.bind(this));
		}
	});
}();
