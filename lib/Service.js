!function(){

	var   Class 			= require('ee-class')
		, log 				= require('ee-log')
		, project 			= require('ee-project')
		, Webservice 		= require('ee-webservice')
		, FormDataCollector = require('em-formdata-collector');



	module.exports = new Class({

		init: function() {
			this.webservice = new Webservice(project.config);
			this.webservice.use(new FormDataCollector());
			this.webservice.use(this);
			this.webservice.listen(); 
		}


		, request: function(request, response, next) {
			log(request.getHeaders());
			log(request.getUri());
			log(request.query);

			if (request.method === 'post') {
				request.getForm(function(data) {
					try {
						var pushed = JSON.parse(data.payload);
						log(pushed);
					} catch(e) {
						log(e);
					}
				}.bind(this));
			}

			response.send(200);
		}
	});
}();
