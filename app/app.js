'use strict';
var Application = (function() {
    return {
        init: function() {
            if (!location.hash) {
                location.hash = '#/';
            }
            StateManager.restore();
            StateManager.setHandler();

        }
    };
})();



var StateManager = (function() {

    var viewContainer = document.getElementById('viewContainer');
    var currentPageTitle = document.getElementById('currentPageTitle');

    var currentState = null;

    var states = [
        {
            Name: 'search',
            Title: 'Поиск пользователей',
            Pattern: /^#\/$/,
            Controller: SearchController
        },
        {
            Name: 'profile.main',
            Title: 'Основная информация',
            Pattern: /^#\/profile\/([0-9]+)\/main\/?$/,
            Controller: ProfileMainController
        },
        {
            Name: 'profile.followers',
            Title: 'Подписчики',
            Pattern: /^#\/profile\/([0-9]+)\/followers\/?$/,
            Controller: ProfileFollowersController
        },
        {
            Name: 'profile.followings',
            Title: 'Подписки',
            Pattern: /^#\/profile\/([0-9]+)\/followings\/?$/,
            Controller: ProfileFollowingsController
        },
        {
            Name: 'profile.repositories',
            Title: 'Репозитории',
            Pattern: /^#\/profile\/([0-9]+)\/repositories\/?$/,
            Controller: ProfileRepositoriesController
        }
    ];

    // определение текущего стейта из доступных по хэшу
    var setCurrentState = function() {
        for (var i = 0; i < states.length; i++) {
            if (states[i].Pattern.test(location.hash)) {
                currentState = states[i];
                break;
            }
            currentState = null;
        }
    };


    var makeUserList = function(userList) {
        var contentArea = document.getElementById('contentArea');
        var ul = document.createElement('ul');
        ul.className = 'users-list';
        var fragment = document.createDocumentFragment();
        var li = null;
        var a = null;

        userList.forEach(function(user) {
            a = document.createElement('a');
            a.href = '#/profile/' + user.id + '/main';
            a.className = 'users-list__link';
            a.appendChild(document.createTextNode(user.login));
            li = document.createElement('li');
            li.className = 'users-list__item';
            li.appendChild(a);
            fragment.appendChild(li);
        });
        ul.appendChild(fragment);
        contentArea.appendChild(ul);
    };

    var makeRepositoryList = function(repositoryList) {
        var repositoriesContainer = document.getElementById('contentArea');
        var ul = document.createElement('ul');
        ul.className = 'repository-list';
        var repositoryTemplate = '<li class="repository-list__item">' +
            '<span class="repository-list__title">{{name}}</span>' +
            '<a class="repository-list__link" href="{{url}}" target="_blank">{{url}}</a></li>';
        var generatedList = "";
        var parsedTemplate = "";
        repositoryList.forEach(function(repository) {
            parsedTemplate = repositoryTemplate.replace(/\{\{name}}/g, repository.name);
            parsedTemplate = parsedTemplate.replace(/\{\{url}}/g, repository.html_url);
            generatedList += parsedTemplate;
        });
        ul.innerHTML = generatedList;
        repositoriesContainer.appendChild(ul);
    };


    var stateHandler = function() {
        setCurrentState();
        var controller;
        if (currentState) {
            controller = new currentState.Controller(currentState);
        } else {
            controller = new NotFoundController();
        }
        if (controller.hasOwnProperty('getData')) {

            controller.getData(function(receivedData) {
                controller.data = receivedData;
                currentPageTitle.innerHTML = Users.getCurrentUser().login + '::' + currentState.Title;
                controller.loadTemplate(controller.templatePath, function(template) {
                    if (controller.data instanceof Array) {
                        viewContainer.innerHTML = controller.parseTemplate(template, {
                            userId: RegExp.$1
                        });
                        if (controller.data.length == 0) {
                            //ничего не найдено
                            var contentArea = document.getElementById('contentArea');
                            var p = document.createElement('p');
                            p.className = 'profile-content__users-empty';
                            p.appendChild(document.createTextNode('Пользователи отсутствуют.'));
                            contentArea.appendChild(p);

                        } else {
                            //делаем список

                            switch (currentState.Name) {
                                case 'profile.followers':
                                case 'profile.followings':
                                    makeUserList(controller.data);
                                    break;
                                case 'profile.repositories':
                                    makeRepositoryList(controller.data);
                                    break;
                            }

                        }





                    } else {
                        //вкладка основной информации или просто вкладка, где не нужно формировать списки элементов
                        viewContainer.innerHTML = controller.parseTemplate(template, {
                            userId: RegExp.$1,
                            avatar: controller.data.avatar_url,
                            name: controller.data.name || 'Не указано',
                            company: controller.data.company || 'Не указано',
                            repositoryCount: controller.data.public_repos,
                            gistCount: controller.data.public_gists,
                            followingsCount: controller.data.following
                        });
                    }

                });
            });



        } else {
            currentPageTitle.innerHTML = currentState.Title;
            controller.loadTemplate(controller.templatePath, function(template) {
                viewContainer.innerHTML = template;
            });
        }

        if (controller.hasOwnProperty('initListeners')) {
            controller.initListeners();
        }

    };
    return {
        restore: function() {
            if (location.hash !== '') {
                stateHandler();
            }
        },
        setHandler: function() {
            window.addEventListener('hashchange', stateHandler, false);
        }
    };
})();

window.addEventListener('load', function(event) {
    Application.init();
}, false);




