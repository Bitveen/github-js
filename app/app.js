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
        var usersArea = document.getElementById('usersArea');
        if (userList.length > 0) {
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
            usersArea.appendChild(ul);

        } else {
            var p = document.createElement('p');
            p.className = 'profile-content__users-empty';
            p.appendChild(document.createTextNode('Пользователи отсутствуют.'));
            usersArea.appendChild(p);
        }


    };
    var viewContainer = document.getElementById('viewContainer');
    var currentPageTitle = document.getElementById('currentPageTitle');

    /*var profilePatternMain =
    var profilePatternFollowers = /#\/profile\/([0-9]+)\/followers/;
    var profilePatternFollowings = /#\/profile\/([0-9]+)\/followings/;
    var profilePatternRepositories = /#\/profile\/([0-9]+)\/repositories/;*/


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
                controller.loadTemplate(controller.templatePath, function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userId: RegExp.$1
                    });

                    if (controller.data instanceof Array) {
                        // это значит, что нужно проверить размер,
                        // если он равен нулю, то выводить что пусто


                        if (controller.data.length == 0) {
                            //ничего не найдено
                            var contentArea = document.getElementById('contentArea');
                            var p = document.createElement('p');
                            p.className = 'profile-content__users-empty';
                            p.appendChild(document.createTextNode('Пользователи отсутствуют.'));
                            contentArea.appendChild(p);

                        } else {
                            //делаем список
                            console.log('Has Data');
                        }



                    }








                });
            });
        } else {
            controller.loadTemplate(controller.templatePath, function(template) {
                viewContainer.innerHTML = template;
            });
        }











/*        if (location.hash == '#/') {
            controller = null;
            controller = new SearchController();
            currentPageTitle.innerHTML = 'Поиск пользователей';
            controller.loadTemplate('/templates/search.html', function(template) {
                viewContainer.innerHTML = template;
            });


        } else if (profilePatternMain.test(location.hash)) {
            controller = null;
            controller = new ProfileController();

            userId = RegExp.$1;
            currentPageTitle.innerHTML = 'Основная информация';
            Users.getInfo(userId, function(data) {
                controller.loadTemplate('/templates/profile_main.html', function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userId: userId,
                        avatar: data.avatar_url,
                        name: data.name || 'Не указано',
                        company: data.company || 'Не указано',
                        repositoryCount: data.public_repos,
                        gistCount: data.public_gists,
                        followingsCount: data.following
                    });
                });
            });






        } else if (profilePatternFollowers.test(location.hash)) {

            controller = null;
            controller = new ProfileController();

            userId = RegExp.$1;
            currentPageTitle.innerHTML = 'Подписчики';
            Users.getFollowers(userId, function(data) {
                controller.loadTemplate('/templates/profile_followers.html', function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userId: userId
                    });
                    makeUserList(data);



                });


            });






        } else if (profilePatternFollowings.test(location.hash)) {

            controller = null;
            controller = new ProfileController();

            userId = RegExp.$1;
            currentPageTitle.innerHTML = 'Подписки';
            Users.getFollowings(userId, function(data) {
                controller.loadTemplate('/templates/profile_followings.html', function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userId: userId
                    });
                    makeUserList(data);
                });
            });



        } else if (profilePatternRepositories.test(location.hash)) {

            controller = null;
            controller = new ProfileController();

            userId = RegExp.$1;
            currentPageTitle.innerHTML = 'Репозитории';

            Users.getRepositories(userId, function(data) {
                controller.loadTemplate('/templates/profile_repositories.html', function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userId: userId
                    });
                    var repositoriesContainer = document.getElementById('repositoriesContainer');
                    if (data.length > 0) {
                        var ul = document.createElement('ul');
                        ul.className = 'repository-list';

                        var repositoryTemplate = '<li class="repository-list__item">' +
                            '<span class="repository-list__title">{{name}}</span>' +
                            '<a class="repository-list__link" href="{{url}}" target="_blank">{{url}}</a></li>';

                        var generatedList = "";
                        var parsedTemplate = "";
                        data.forEach(function(item) {
                            parsedTemplate = repositoryTemplate.replace(/\{\{name}}/g, item.name);
                            parsedTemplate = parsedTemplate.replace(/\{\{url}}/g, item.html_url);
                            generatedList += parsedTemplate;
                        });
                        ul.innerHTML = generatedList;
                        repositoriesContainer.appendChild(ul);

                    } else {
                        var p = document.createElement('p');
                        p.className = 'profile-content__repositories-empty';
                        repositoriesContainer.appendChild(p.appendChild(document.createTextNode('Репозитории отсутствуют.')));
                    }

                });
            });



        }*/
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




