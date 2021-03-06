// Generated by CoffeeScript 1.10.0
(function() {
  var HipChatAdmin, HipChatWebhooksDirective, debounce, hipChatInfo, initHipChatPlugin, module;

  this.taigaContribPlugins = this.taigaContribPlugins || [];

  hipChatInfo = {
    slug: "hipchat",
    name: "HipChat",
    type: "admin",
    module: 'taigaContrib.hipchat'
  };

  this.taigaContribPlugins.push(hipChatInfo);

  module = angular.module('taigaContrib.hipchat', []);

  debounce = function(wait, func) {
    return _.debounce(func, wait, {
      leading: true,
      trailing: false
    });
  };

  initHipChatPlugin = function($tgUrls) {
    return $tgUrls.update({
      "hipchat": "/hipchat"
    });
  };

  HipChatAdmin = (function() {
    HipChatAdmin.$inject = ["$rootScope", "$scope", "$tgRepo", "tgAppMetaService", "$tgConfirm", "$tgHttp"];

    function HipChatAdmin(rootScope, scope, repo, appMetaService, confirm, http) {
      this.rootScope = rootScope;
      this.scope = scope;
      this.repo = repo;
      this.appMetaService = appMetaService;
      this.confirm = confirm;
      this.http = http;
      this.scope.sectionName = "HipChat";
      this.scope.sectionSlug = "hipchat";
      this.scope.$on("project:loaded", (function(_this) {
        return function() {
          var promise;
          promise = _this.repo.queryMany("hipchat", {
            project: _this.scope.projectId
          });
          promise.then(function(hipchathooks) {
            var description, title;
            _this.scope.hipchathook = {
              project: _this.scope.projectId,
              notify_userstory_create: true,
              notify_userstory_change: true,
              notify_userstory_delete: true,
              notify_task_create: true,
              notify_task_change: true,
              notify_task_delete: true,
              notify_issue_create: true,
              notify_issue_change: true,
              notify_issue_delete: true,
              notify_wikipage_create: true,
              notify_wikipage_change: true,
              notify_wikipage_delete: true
            };
            if (hipchathooks.length > 0) {
              _this.scope.hipchathook = hipchathooks[0];
            }
            title = _this.scope.sectionName + " - Plugins - " + _this.scope.project.name;
            description = _this.scope.project.description;
            return _this.appMetaService.setAll(title, description);
          });
          return promise.then(null, function() {
            return _this.confirm.notify("error");
          });
        };
      })(this));
    }

    HipChatAdmin.prototype.testHook = function() {
      var promise;
      promise = this.http.post(this.repo.resolveUrlForModel(this.scope.hipchathook) + '/test');
      promise.success((function(_this) {
        return function(_data, _status) {
          return _this.confirm.notify("success");
        };
      })(this));
      return promise.error((function(_this) {
        return function(data, status) {
          return _this.confirm.notify("error");
        };
      })(this));
    };

    return HipChatAdmin;

  })();

  module.controller("ContribHipChatAdminController", HipChatAdmin);

  HipChatWebhooksDirective = function($repo, $confirm, $loading) {
    var link;
    link = function($scope, $el, $attrs) {
      var form, submit, submitButton;
      form = $el.find("form").checksley({
        "onlyOneErrorElement": true
      });
      submit = debounce(2000, (function(_this) {
        return function(event) {
          var currentLoading, promise;
          event.preventDefault();
          if (!form.validate()) {
            return;
          }
          currentLoading = $loading().target(submitButton).start();
          if (!$scope.hipchathook.id) {
            promise = $repo.create("hipchat", $scope.hipchathook);
            promise.then(function(data) {
              return $scope.hipchathook = data;
            });
          } else if ($scope.hipchathook.url) {
            promise = $repo.save($scope.hipchathook);
            promise.then(function(data) {
              return $scope.hipchathook = data;
            });
          } else {
            promise = $repo.remove($scope.hipchathook);
            promise.then(function(data) {
              return $scope.hipchathook = {
                project: $scope.projectId,
                notify_userstory_create: true,
                notify_userstory_change: true,
                notify_userstory_delete: true,
                notify_task_create: true,
                notify_task_change: true,
                notify_task_delete: true,
                notify_issue_create: true,
                notify_issue_change: true,
                notify_issue_delete: true,
                notify_wikipage_create: true,
                notify_wikipage_change: true,
                notify_wikipage_delete: true
              };
            });
          }
          promise.then(function(data) {
            currentLoading.finish();
            return $confirm.notify("success");
          });
          return promise.then(null, function(data) {
            currentLoading.finish();
            form.setErrors(data);
            if (data._error_message) {
              return $confirm.notify("error", data._error_message);
            }
          });
        };
      })(this));
      submitButton = $el.find(".submit-button");
      $el.on("submit", "form", submit);
      return $el.on("click", ".submit-button", submit);
    };
    return {
      link: link
    };
  };

  module.directive("contribHipchatWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", HipChatWebhooksDirective]);

  module.run(["$tgUrls", initHipChatPlugin]);

  module.run([
    '$templateCache', function($templateCache) {
      return $templateCache.put('contrib/hipchat', '<div contrib-hipchat-webhooks="contrib-hipchat-webhooks" ng-controller="ContribHipChatAdminController as ctrl"><header><h1><span class="project-name">{{::project.name}}</span><span class="green">{{::sectionName}}</span></h1></header><form><fieldset><label for="url">HipChat webhook url</label><div class="contrib-form-wrapper"><input type="text" name="url" ng-model="hipchathook.url" placeholder="Write here the url" id="url" data-type="url" class="contrib-input"/><a href="" title="Test" ng-click="ctrl.testHook()" ng-show="hipchathook.id" class="contrib-test button-gray"><span>Test</span></a></div></fieldset><fieldset><h2>Notifications on Hipchat</h2><div class="check-item"><span>Enable notifications on Hipchat</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><fieldset><h2>Notify User Stories</h2><div class="check-item"><span>Create</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_userstory_create"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Change</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_userstory_change"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Delete</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_userstory_delete"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><fieldset><h2>Notify Tasks</h2><div class="check-item"><span>Create</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_task_create"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Change</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_task_change"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Delete</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_task_delete"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><fieldset><h2>Notify Issues</h2><div class="check-item"><span>Create</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_issue_create"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Change</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_issue_change"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Delete</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_issue_delete"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><fieldset><h2>Notify Wiki</h2><div class="check-item"><span>Create</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_wikipage_create"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Change</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_wikipage_change"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Delete</span><div class="check"><input type="checkbox" name="notification" ng-model="hipchathook.notify_wikipage_delete"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><button type="submit" class="hidden"></button><a href="" title="Save" ng-click="ctrl.updateOrCreateHook(hipchathook)" class="button-green submit-button"><span>Save</span></a></form><a href="https://taiga.io/support/hipchat-integration/" target="_blank" class="help-button"><span class="icon icon-help"></span><span>Do you need help? Check out our support page!</span></a></div>');
    }
  ]);

}).call(this);
