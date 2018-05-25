/*!
 * evolent-assignment - v1.0.0 - 2018-05-25
 * 
 * Copyright (c) 2018 Anup Singh, Mumbai;
 */
(function() {
    'use strict';

    var app = angular.module('evolent', [
        'routes',
        'templates.app',
        'contacts',
        'services',
        'ngSanitize',
        'ui-notification'
    ]);
    app.run(runBlock);
    app.controller('AppCtrl', AppController);
    app.controller('NotFoundController', NotFoundController);

    runBlock.$inject = ['$rootScope', '$state', '$stateParams', '$location'];
    config.$inject = ['NotificationProvider'];

    function runBlock($rootScope, $state, $stateParams, $location) {
        if (!$location.path() || $location.path() === "/") {
            $location.path("/contacts/list");
        }

        $rootScope.$on('$stateChangeError', function(event) {
            console.log("$stateChangeError");
            $state.go('404');
        });
    }

    AppController.$inject = ['$stateParams'];

    function AppController($stateParams) {
        console.log('$stateParams', $stateParams);

    }

    NotFoundController.$inject = ['$stateParams'];

    function NotFoundController($stateParams) {
        console.log("not found controller");
    }

    function config(NotificationProvider){

        NotificationProvider.setOptions({
            delay: 3000,
            startTop: 100,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'top',
            closeOnClick: false
        });
    }
})();
(function() {
    'use strict';

    angular
        .module('contacts', [])
        .controller('ContactListCtrl', ContactListCtrl)
        .controller('ContactEditCtrl', ContactEditCtrl);

    ContactListCtrl.$inject = ['api', 'components', '$location', 'Notification'];

    function ContactListCtrl(api, components, $location, Notification) {
        var headers = components.getHeaders(),
            params = {
                content_uid: "contacts",
                locale: "en-us"
            },
            self = this;
        self.loader = true;
        api.contacts.list(params, headers)
            .then(function(data) {
                console.log("entry list", data.entries);
                self.contactList = data.entries;
                self.loader = false;
            }).
        catch(function(error) {
            console.log("entry error", error);
        });

        self.deleteContact = function(uid, index) {
            self.loader = true;
            params.entry_uid = uid;
            api.contacts.delete(params, headers)
                .then(function(data) {
                    self.contactList.splice(index, 1);
                    console.log(self.contactList, index);
                    Notification.success("Contact deleted successfully");
                    self.loader = false;
                })
                .catch(function(error) {
                    console.log("entry error", error);
                    Notification.error(error.error_message);
                    self.loader = false;
                });
        };

        self.createContact = function() {
            $location.path('/contacts/create');
        };

        self.editContactPage = function(uid) {
            $location.path('/contacts/' + uid + '/edit');
        };
    }

    ContactEditCtrl.$inject = ['$stateParams', 'api', 'components', '$location', 'Notification'];

    function ContactEditCtrl($stateParams, api, components, $location, Notification) {
        var headers = components.getHeaders(),
            params = {
                content_uid: "contacts",
                locale: "en-us"
            },
            self = this;
        self.contactInfo = {};
        self.loader = true;
        if ($stateParams.contact_uid) {
            self.isEdit = true;
            params.entry_uid = $stateParams.contact_uid;
            api.contacts.single(params, headers)
                .then(function(data) {
                    console.log("entry info", data.entry);
                    self.contactInfo = data.entry;
                    self.loader = false;
                }).
            catch(function(error) {
                console.log("entry error", error);
                Notification.error("No Contact found");
                self.loader = false;
                $location.path('/contacts/list');
            });
        } else {
            self.loader = false;
            self.contactInfo.status = true;
        }

        self.deleteContact = function() {
            self.loader = true;
            api.contacts.delete(params, headers)
                .then(function(data) {
                    console.log("entry info", data.entry);
                    self.loader = false;
                    Notification.success("Contact deleted successfully");
                    $location.path('/contacts/list');
                }).
            catch(function(error) {
                console.log("entry error", error);
                Notification.error(error.error_message);

            });
        };

        self.saveInfo = function(contactInfo) {
            self.loader = true;
            console.log("saveInfo", contactInfo);
            var info = {
                    entry: {
                        title: contactInfo.title,
                        first_name: contactInfo.first_name,
                        last_name: contactInfo.last_name,
                        number: contactInfo.number,
                        status: contactInfo.status,
                    }
                },
                action = (self.isEdit) ? "update" : "create";

            api.contacts[action](info, params, headers)
                .then(function(data) {
                    console.log('submit data', data);
                    self.loader = false;
                    $location.path('/contacts/list');
                    if (action === 'create') {
                        Notification.success("Contact created successfully");
                    } else {
                        Notification.success("Contact updated successfully");
                    }
                })
                .catch(function(error) {
                    console.log('error log', error);

                    if (action === 'create') {
                        Notification.error("Email id is already registered or Invalid data");
                    } else {
                        Notification.error(error.error_message);
                    }
                    self.loader = false;
                });
        };

        self.gotoList = function() {
            $location.path('/contacts/list');
        };

        self.createContact = function() {
            $location.path('/contacts/create');
        };
    }
})();
(function() {
    'use strict';

    angular
        .module('routes.contacts', [
            'ui.router'
        ])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('contacts', {
                    url: '/contacts',
                    abstract: true,
                    views: {
                        'container': {
                            template: '<div ui-view="contact-container">This is my contact container</div>'
                        }
                    }
                })
                .state('contacts.list', {
                    url: '/list',
                    views: {
                        'contact-container': {
                            templateUrl: 'contacts/contact-list.tpl.html',
                            controller: 'ContactListCtrl',
                            controllerAs: 'clist'
                        }
                    }
                })
                .state('contacts.edit', {
                    url: '/:contact_uid/edit',
                    views: {
                        'contact-container': {
                            templateUrl: 'contacts/contact-edit.tpl.html',
                            controller: 'ContactEditCtrl',
                            controllerAs: 'cedit'
                        }
                    }
                })
                .state('contacts.create', {
                    url: '/create',
                    views: {
                        'contact-container': {
                            templateUrl: 'contacts/contact-edit.tpl.html',
                            controller: 'ContactEditCtrl',
                            controllerAs: 'cedit'                        
                        }
                    }
                });
                
        }]);
})();
(function() {
    'use strict';

    angular
        .module('routes', [
            'ui.router',
            'routes.contacts'
        ])
        .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function ($locationProvider, $stateProvider, $urlRouterProvider) {
            $locationProvider.html5Mode(false).hashPrefix('!');
            console.log("routing",$stateProvider);
            $stateProvider
                .state('404', {
                    url : '*path',
                    views: {
                        'container': {
                            templateUrl: '404.tpl.html',
                            controller: 'NotFoundController',
                            controllerAs: 'notfound'
                        }
                    }
                });
                
        }]);
})();
(function(){
    'use strict';

    angular
        .module('services', [
            'services.api',
            'services.http',
            'services.components'
        ]);
})();
(function(){
    'use strict';

    angular
        .module('services.api', [
            'services.api.contacts',
        ])
        .factory('api', api);
        
        api.$inject = ['api.contacts'];

        function api(contacts){
           return {
                contacts : contacts,
            };

        }
})();
(function(){
    'use strict';

    angular
        .module('services.api.contacts', [])
        .factory('api.contacts', contacts);
    contacts.$inject = ['httpRequest', '$q'];

    function contacts(httpRequest){
        return {
            list : function(params, headers){
                return httpRequest.getData({method: 'GET', url: "content_types/"+params.content_uid+"/entries", params: params, headers: headers});
            },
            single : function(params, headers){
                return httpRequest.getData({method: 'GET', url: "content_types/"+params.content_uid+"/entries/" + params.entry_uid, params: params.locale, headers: headers});
            },
            create : function(data, params, headers){
                return httpRequest.getData({method: 'POST', url: "content_types/"+params.content_uid+"/entries/", params : params, data: data, headers: headers});
            },
            update : function(data, params, headers){
                return httpRequest.getData({method: 'PUT', url: "content_types/"+params.content_uid+"/entries/" + params.entry_uid,  data: data, headers: headers});
            },
            delete : function(params, headers){
                return httpRequest.getData({method: 'DELETE', url: "content_types/"+params.content_uid+"/entries/" + params.entry_uid, params: params, headers: headers});
            }
        };
    }
})();
(function(){
    'use strict';

    angular
        .module('services.http', [])
        .factory('httpRequest', httpRequest);

        httpRequest.$inject = ['$http', '$q'];

        function httpRequest($http, $q){
            return {
                getData : getData
            };
            function getData(options) {
                console.log("options",options);
                var url =  'v3/'+options.url;
                options.params = _.extend(options.params || {}, {r: Math.random()});
                return $http({
                    method: options.method,
                    url: url,
                    headers: options.headers,
                    data: options.data || {},
                    params:options.params
                })
                .then(success)
                .catch(error);
            }
            function success(res){
                console.log("res in http", res);
                return res.data;
            }
            function error(err){
                console.log("err in http", err);
                return $q.reject(err.data);
            }
        }
})();

(function() {
    'use strict';

    angular
        .module('services.components', [])
        .factory('components', Components);

    function Components() {
        return {
            getHeaders: getHeaders
        };

        function getHeaders() {
            var headers = {
                authtoken: "blt8dac0df052b5abc6",
                api_key: "bltff37180b56d050c7",
                'Content-Type' : "application/json"
            };

            return headers;
        }
    }

})();
(function(){
    'use strict';

    angular
        .module('services.http', [])
        .factory('httpRequest', httpRequest);

        httpRequest.$inject = ['$http', '$q', '$rootScope', '$location'];

        function httpRequest($http, $q, $rootScope, $location){
            return {
                getData : getData
            };
            function getData(options) {
                console.log("options",options);
                var url =  'v3/'+options.url;
                options.params = _.extend(options.params || {}, {r: Math.random()});
                options.headers = _.extend(options.headers || {}, {"Content-Type" : "application/json"});
                return $http({
                    // ignoreLoadingBar: options.params.ignoreLoadingBar || (options.data && options.data.ignoreLoadingBar) || false,
                    method: options.method,
                    url: url,
                    headers: options.headers,
                    data: options.data || {},
                    params:options.params
                })
                .then(success)
                .catch(error);
            }
            function success(res){
                console.log("res in http", res);
                return res.data;
            }
            function error(err){
                console.log("err in http", err);
                // if(!(err.status >= 400 && err.status < 500)) {
                //     window.trackJs.track(err.config.method + " " + err.status + " " + err.statusText + ": " + err.config.url);
                // }
                // if((err.status === 401 || err.error_code === 105)) {
                //     $rootScope.$broadcast("$clearSession", err);
                // } 
                return $q.reject(err.data);
            }
        }
})();

angular.module("templates.app", []).run(["$templateCache", function($templateCache) {$templateCache.put("404.tpl.html","<div class=\"error-section\">\r\n    <div class=\"error-details\">\r\n        <span>Oops!</span>\r\n        <h3>Something went wrong, or this page doesn\'t exist yet.</a></h3>\r\n    </div>\r\n</div>");
$templateCache.put("contacts/contact-edit.tpl.html","<div class=\"pull-right\">\r\n    <button data-ng-click=\"cedit.createContact()\" class=\"btn btn-success\" data-ng-if=\"cedit.isEdit\">Create New Contact</button>\r\n</div>\r\n<div class=\"sub-wrapper\">\r\n    <div data-ng-if=\"!cedit.isEdit\" class=\"page-name\">Create Contact</div>\r\n    <div data-ng-if=\"cedit.isEdit\" class=\"page-name\">Edit Contact</div>\r\n    <form novalidate name=\"form\" data-accessible-form data-ng-submit=\"submit = true; form.$valid && cedit.saveInfo(cedit.contactInfo)\" autocomplete=\"off\">\r\n        <div class=\"form-group\" data-ng-class=\"{\'has-error\':form.fname.$error.required && (form.fname.$touched || submit)}\">\r\n            <label>First Name <span class=\"mandatory\">*</span></label>\r\n            <input type=\"text\" required class=\"form-control\" id=\"fname\" data-ng-model=\"cedit.contactInfo.first_name\" name=\"fname\" placeholder=\"First Name\">\r\n        </div>\r\n        <div class=\"form-group\" data-ng-class=\"{\'has-error\':form.lname.$error.required && (form.lname.$touched || submit)}\">\r\n            <label>Last Name <span class=\"mandatory\">*</span></label>\r\n            <input type=\"text\" required class=\"form-control\" id=\"lname\" data-ng-model=\"cedit.contactInfo.last_name\" name=\"lname\" placeholder=\"Last Name\">\r\n        </div>\r\n        <div class=\"form-group\" data-ng-class=\"{\'has-error\':(form.email.$error.required || form.email.$invalid) && (form.email.$touched || submit)}\">\r\n            <label>Email address <span class=\"mandatory\">*</span></label>\r\n            <input type=\"email\" required class=\"form-control\" id=\"email\" data-ng-model=\"cedit.contactInfo.title\" name=\"email\" placeholder=\"Email\">\r\n        </div>\r\n        <div class=\"form-group\" data-ng-class=\"{\'has-error\':(form.phone.$error.required || form.phone.$invalid) && (form.phone.$touched || submit)}\">\r\n            <label>Phone Number <span class=\"mandatory\">*</span></label>\r\n            <input type=\"number\" required class=\"form-control\" id=\"email\" data-ng-model=\"cedit.contactInfo.number\" name=\"phone\" minlength=\"7\" maxlength=\"10\" placeholder=\"10 digit Number\">\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label>Status:</label>\r\n            <div class=\"radio\">\r\n                <label>\r\n                    <input type=\"radio\" name=\"optradio\" data-ng-click=\"cedit.contactInfo.status = true\" data-ng-checked=\"cedit.contactInfo.status == true\" >Active</label>\r\n            </div>\r\n            <div class=\"radio\">\r\n                <label>\r\n                    <input type=\"radio\" name=\"optradio\" data-ng-click=\"cedit.contactInfo.status = false\" data-ng-checked=\"cedit.contactInfo.status == false\" checked=\"checked\">Inactive</label>\r\n            </div>\r\n        </div>\r\n        <div class=\"button-group\">\r\n            <img src=\"/static//images/loader.gif\" width=\"50px\" class=\"loader\" data-ng-if=\"cedit.loader\">\r\n            <button type=\"button\" class=\"btn btn-default\" data-ng-click=\"cedit.gotoList()\">Cancel</button>\r\n            <button type=\"button\" class=\"btn btn-danger\" data-ng-if=\"cedit.isEdit\" data-ng-click=\"cedit.deleteContact()\">Delete</button>\r\n            <button type=\"submit\" class=\"btn btn-primary\" data-ng-if=\"cedit.isEdit\">Update</button>\r\n            <button type=\"submit\" class=\"btn btn-primary\" data-ng-if=\"!cedit.isEdit\">Create</button>\r\n        </div>\r\n    </form>\r\n</div>");
$templateCache.put("contacts/contact-list.tpl.html","<div class=\"pull-right\">\r\n    <button data-ng-click=\"clist.createContact()\" class=\"btn btn-success\">Create New Contact</button>\r\n</div>\r\n<div class=\"table\">\r\n    <ul class=\"table-head\">\r\n        <li>\r\n            <div class=\"table-cell w-20\">Name</div>\r\n            <div class=\"table-cell w-20\">Email</div>\r\n            <div class=\"table-cell w-20\">Phone No.</div>\r\n            <div class=\"table-cell w-20\">Status</div>\r\n        </li>\r\n    </ul>\r\n    <ul class=\"table-body\">\r\n        <li class=\"table-row dropdown\" data-ng-repeat=\"list in clist.contactList track by $index\">\r\n            <div class=\"shrink-row\">\r\n                <a class=\"clearfix\" data-ng-click=\"clist.editContactPage(list.uid)\">\r\n                    <div class=\"table-cell w-20\">{{list.first_name}}&nbsp;{{list.last_name}}</div>\r\n                    <div class=\"table-cell w-20\">{{list.title}}</div>\r\n                    <div class=\"table-cell w-20\">{{list.number}}\r\n                    </div>\r\n                    <div class=\"table-cell w-20\">\r\n                        <span data-ng-if=\"list.status == true\" class=\"active\">Active</span>\r\n                        <span data-ng-if=\"list.status == false\" class=\"inactive\">Inactive</span>\r\n                    </div>\r\n                    <div class=\"table-cell w-20\" title=\"Delete Contact\">\r\n                        <button class=\"deleteButton\" data-ng-click=\"clist.deleteContact(list.uid,$index);$event.stopImmediatePropagation()\">-</button>\r\n                    </div>\r\n                </a>\r\n            </div>\r\n        </li>\r\n        <div data-ng-if=\"clist.loader\">\r\n            <img src=\"/static//images/loader.gif\" width=\"50px\" class=\"loader\">\r\n        </div>\r\n        <div class=\"no-match-found\" data-ng-if=\"!clist.contactList.length && !clist.loader\">\r\n            <p>No contacts available</p>\r\n        </div>\r\n    </ul>\r\n</div>");
$templateCache.put("partials/footer.tpl.html","<div class=\'term-bar\'>\r\n    <div>\r\n        <span class=\"copy-right\"><a href=\"mailto:anupsingh24@gmail.com\" target=\"_self\">anupsingh24@gmail.com</a> | Copyright © 2018. All Rights Reserved.</span>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("partials/header.tpl.html","<div class=\"board\"><a href=\"#!/contacts/list\">Contact Management</a></div>");}]);