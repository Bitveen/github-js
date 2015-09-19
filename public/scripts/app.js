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





function BaseController() {}

BaseController.prototype.loadTemplate = function(pathToTemplate, callback) {
    var template = sessionStorage.getItem(pathToTemplate);
    if (!template) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', pathToTemplate, true);
        xhr.send(null);
        xhr.addEventListener('load', function(event) {
            var response = event.target;
            if (response.status == 200) {
                template = response.responseText;
                sessionStorage.setItem(pathToTemplate, template);
                callback(template);
            }
        }, false);
    } else {
        callback(template);
    }

};
BaseController.prototype.parseTemplate = function(template, data) {
    var regexp;
    for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
            regexp = new RegExp('\{\{'+ prop +'}}', 'g');
            template = template.replace(regexp, data[prop]);
        }
    }
    return template;
};




function SearchController(state) {
    this.templatePath = '/templates/search.html';



    /*        var searchArea = document.getElementById('searchArea');
     var searchInput = document.getElementById('searchInput');


     searchInput.addEventListener('keyup', function(event) {
     var _self = this;
     if (_self.value.length >= 3) {
     setTimeout(function() {

     Users.find(_self.value, function(data) {
     var userList = document.createDocumentFragment();
     var ul = document.createElement('ul');
     var li = null;
     ul.className = "search-results__result";

     data.items.forEach(function(item) {
     li = document.createElement('li');
     li.className = "search-results__item";
     li.dataset.login = item.login;
     li.appendChild(document.createTextNode(item.login));
     userList.appendChild(li);
     });
     ul.appendChild(userList);
     searchArea.replaceChild(ul, searchArea.firstElementChild);

     });

     }, 500);

     }

     }, false);


     searchArea.addEventListener('click', function(event) {
     if (event.target.tagName.toLowerCase() === 'li') {
     Users.getInfo(event.target.dataset.login, function(data) {
     console.log(data);
     });
     }
     }, false);*/

}
SearchController.prototype = Object.create(BaseController.prototype);


/* Контроллер для вкладки с основной информацией */
function ProfileMainController(state) {
    this.templatePath = '/templates/profile_main.html';
    this.data = null;
    this.getData = function(callback) {
        Users.getInfo(RegExp.$1, callback);
    };
}
ProfileMainController.prototype = Object.create(BaseController.prototype);


/* Контроллер для вкладки с подписчиками */
function ProfileFollowersController(state) {
    this.templatePath = '/templates/profile_followers.html';
    this.data = null;
    this.noDataText = 'Пользователи отсутствуют.';

    this.getData = function(callback) {
        Users.getFollowers(RegExp.$1, callback);
    };

}
ProfileFollowersController.prototype = Object.create(BaseController.prototype);



/* Контроллер для вкладки с подписками */
function ProfileFollowingsController(state) {
    this.templatePath = '/templates/profile_followings.html';
    this.data = null;
    this.noDataText = 'Пользователи отсутствуют.';

    this.getData = function(callback) {
        Users.getFollowings(RegExp.$1, callback);
    };
}
ProfileFollowingsController.prototype = Object.create(BaseController.prototype);



/* Контроллер для вкладки с репозиториями */
function ProfileRepositoriesController(state) {
    this.templatePath = '/templates/profile_repositories.html';
    this.data = null;
    this.noDataText = 'Репозитории отсутствуют.';

    this.getData = function(callback) {
        Users.getRepositories(RegExp.$1, callback);
    };
}
ProfileRepositoriesController.prototype = Object.create(BaseController.prototype);




function NotFoundController() {
    this.templatePath = '/templates/not_found.html';
}
NotFoundController.prototype = Object.create(BaseController.prototype);
var Users = (function() {
    /* Закрытые методы и свойства */

    return {
        find: function(query, callback) {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', 'https://api.github.com/search/users?q=' + query, true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }

            }, false);

        },
        getInfo: function(userId, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/user/' + userId, true);
            xhr.send(null);
            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }

            }, false);

        },
        getRepositories: function(userId, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/user/' + userId + '/repos', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }
            }, false);

        },
        getFollowers: function(userId, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/user/' + userId + '/followers', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                //<https://api.github.com/user/111631/followers?page=2>; rel="next"
                var linkHeader = response.getResponseHeader('Link');
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }
            }, false);

        },
        getFollowings: function(userId, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/user/' + userId + '/following', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }
            }, false);

        }
    };
})();