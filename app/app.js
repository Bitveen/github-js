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


    var controller = null;
    var viewContainer = document.getElementById('viewContainer');
    var userLogin;
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
                a.href = '#/profile/' + user.login + '/main';
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



    var profilePatternMain = /#\/profile\/([a-zA-z0-9]+)\/main/;
    var profilePatternFollowers = /#\/profile\/([a-zA-z0-9]+)\/followers/;
    var profilePatternFollowings = /#\/profile\/([a-zA-z0-9]+)\/followings/;
    var profilePatternRepositories = /#\/profile\/([a-zA-z0-9]+)\/repositories/;


    var stateHandler = function() {
        if (location.hash == '#/') {
            controller = null;
            controller = new SearchController();
            controller.loadTemplate('/templates/search.html', function(template) {
                viewContainer.innerHTML = template;
            });


        } else if (profilePatternMain.test(location.hash)) {
            /* Основная инфа */
            controller = null;
            controller = new ProfileController();

            userLogin = RegExp.$1;

            Users.getInfo(userLogin, function(data) {
                controller.loadTemplate('/templates/profile_main.html', function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userLogin: userLogin,
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
            /* Подписчики */
            controller = null;
            controller = new ProfileController();

            userLogin = RegExp.$1;

            Users.getFollowers(userLogin, function(data) {
                controller.loadTemplate('/templates/profile_followers.html', function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userLogin: userLogin
                    });
                    makeUserList(data);
                });


            });






        } else if (profilePatternFollowings.test(location.hash)) {
            /* Подписки */
            controller = null;
            controller = new ProfileController();

            userLogin = RegExp.$1;

            Users.getFollowings(userLogin, function(data) {
                controller.loadTemplate('/templates/profile_followings.html', function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userLogin: userLogin
                    });
                    makeUserList(data);
                });
            });



        } else if (profilePatternRepositories.test(location.hash)) {
            /* Репозитории */
            controller = null;
            controller = new ProfileController();

            userLogin = RegExp.$1;

            Users.getRepositories(userLogin, function(data) {
                controller.loadTemplate('/templates/profile_repositories.html', function(template) {
                    viewContainer.innerHTML = controller.parseTemplate(template, {
                        userLogin: userLogin
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




