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
    var stateHandler = function() {
        setCurrentState();
        if (currentState) {
            new currentState.Controller(currentState);
        } else {
            new NotFoundController();
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
        },
        getCurrentState: function() {
            return currentState;
        }
    };



})();

window.addEventListener('load', function(event) {
    Application.init();
}, false);

function BaseController() {
    this.currentPageTitle = document.getElementById('currentPageTitle');
    this.viewContainer = document.getElementById('viewContainer');
    this.spinner = document.getElementById('spinner');
}
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
BaseController.prototype.makeUserList = function(userList) {
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
BaseController.prototype.makeRepositoryList = function(repositoryList) {
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
BaseController.prototype.makeNoDataArea = function() {
    var contentArea = document.getElementById('contentArea');
    var p = document.createElement('p');
    p.className = 'profile-content__result-empty';
    p.appendChild(document.createTextNode(this.noDataText));
    contentArea.appendChild(p);
};




/* Контроллер для поиска пользователей */
function SearchController() {
    BaseController.call(this);
    var _self = this;

    this.templatePath = '/templates/search.html';

    var searchHandler = (function(event) {
        var self = this;
        self.searchInput.removeEventListener('keyup', searchHandler, false);

        setTimeout(function() {
            var element = event.target;
            if (element.value.length == 0) {
                self.searchPlaceholder.style.display = "block";
                self.searchArea.style.display = "none";
            } else {
                Users.find(element.value, function(usersData) {
                    if (usersData.items.length == 0) {
                        self.searchPlaceholder.style.display = "none";
                        self.notFoundBlock.style.display     = "block";
                        self.searchArea.style.display        = "none";
                    } else {
                        self.searchPlaceholder.style.display = "none";
                        self.searchArea.style.display        = "block";
                        self.notFoundBlock.style.display     = "none";
                        var userList = document.createDocumentFragment();
                        var ul = document.createElement('ul');
                        var li = null;
                        var a = null;
                        ul.className = "search-results__result";
                        usersData.items.forEach(function(user) {
                            li = document.createElement('li');
                            a = document.createElement('a');
                            a.href = "#/profile/" + user.id + "/main";
                            a.className = 'search-results__link';
                            a.appendChild(document.createTextNode(user.login));
                            li.className = "search-results__item";
                            li.appendChild(a);
                            userList.appendChild(li);
                        });
                        ul.appendChild(userList);
                        self.searchArea.replaceChild(ul, self.searchArea.firstElementChild);
                    }
                });
            }
            self.searchInput.addEventListener('keyup', searchHandler, false);
        }, 400);



    }).bind(this);


    _self.loadTemplate(_self.templatePath, function(template) {
        document.title = 'Поиск пользователей';
        _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;

        _self.viewContainer.innerHTML = template;

        _self.searchArea        = document.getElementById('searchArea');
        _self.searchInput       = document.getElementById('searchInput');
        _self.searchPlaceholder = document.getElementById('searchPlaceholder');
        _self.notFoundBlock     = document.getElementById('resultNotFound');
        _self.searchInput.addEventListener('keyup', searchHandler, false);
    });


}
SearchController.prototype = Object.create(BaseController.prototype);


/* Контроллер для вкладки с основной информацией */
function ProfileMainController() {
    BaseController.call(this);
    var _self = this;

    this.templatePath = '/templates/profile_main.html';
    Users.getInfo(RegExp.$1, function(receivedData) {
        _self.data = receivedData;

        _self.loadTemplate(_self.templatePath, function(template) {
            _self.spinner.style.display = 'none';
            document.title = 'Основная информация';
            _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;

            _self.viewContainer.innerHTML = _self.parseTemplate(template, {
                userId: RegExp.$1,
                avatar: receivedData.avatar_url,
                name: receivedData.name || 'Не указано',
                company: receivedData.company || 'Не указано',
                repositoryCount: receivedData.public_repos,
                gistCount: receivedData.public_gists,
                followingsCount: receivedData.following
            });
        });
    });
}
ProfileMainController.prototype = Object.create(BaseController.prototype);


/* Контроллер для вкладки с подписчиками */
function ProfileFollowersController() {
    BaseController.call(this);
    var _self = this;

    this.templatePath = '/templates/profile_followers.html';
    this.noDataText = 'Пользователи отсутствуют.';

    Users.getFollowers(RegExp.$1, function(followersList) {
        _self.loadTemplate(_self.templatePath, function(template) {
            _self.spinner.style.display = 'none';
            document.title = 'Подписчики';
            _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;

            _self.viewContainer.innerHTML = _self.parseTemplate(template, {
                userId: RegExp.$1
            });
            if (followersList.length == 0) {
                _self.makeNoDataArea();
            } else {
                _self.makeUserList(followersList);
            }
        });
    });


}
ProfileFollowersController.prototype = Object.create(BaseController.prototype);



/* Контроллер для вкладки с подписками */
function ProfileFollowingsController() {
    BaseController.call(this);

    var _self = this;

    this.templatePath = '/templates/profile_followings.html';

    this.noDataText = 'Пользователи отсутствуют.';

    Users.getFollowings(RegExp.$1, function(followingsList) {

        _self.loadTemplate(_self.templatePath, function(template) {
            _self.spinner.style.display = 'none';
            document.title = 'Подписки';
            _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;

            _self.viewContainer.innerHTML = _self.parseTemplate(template, {
                userId: RegExp.$1
            });
            if (followingsList.length == 0) {
                _self.makeNoDataArea();
            } else {
                _self.makeUserList(followingsList);
            }
        });
    });
}
ProfileFollowingsController.prototype = Object.create(BaseController.prototype);



/* Контроллер для вкладки с репозиториями */
function ProfileRepositoriesController() {
    BaseController.call(this);
    var _self = this;

    this.templatePath = '/templates/profile_repositories.html';
    this.noDataText = 'Репозитории отсутствуют.';

    Users.getRepositories(RegExp.$1, function(repositoriesList) {

        _self.loadTemplate(_self.templatePath, function(template) {
            _self.spinner.style.display = 'none';
            document.title = 'Репозитории';
            _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;

            _self.viewContainer.innerHTML = _self.parseTemplate(template, {
                userId: RegExp.$1
            });
            if (repositoriesList.length == 0) {
                _self.makeNoDataArea();
            } else {
                _self.makeRepositoryList(repositoriesList);
            }
        });
    });

}
ProfileRepositoriesController.prototype = Object.create(BaseController.prototype);


/* Контроллер для обработки ситуации с не найденным стейтом */
function NotFoundController() {
    BaseController.call(this);
    var _self = this;


    this.templatePath = '/templates/not_found.html';
    _self.loadTemplate(_self.templatePath, function(template) {
        document.title = 'Страница не найдена';
        _self.currentPageTitle.innerHTML = 'Страница не найдена.';

        _self.viewContainer.innerHTML = template;
    });
}
NotFoundController.prototype = Object.create(BaseController.prototype);
var Users = (function() {
    /* Закрытые методы и свойства */
    var spinner = document.getElementById('spinner');

    return {
        find: function(query, callback) {
            var xhr = new XMLHttpRequest();

            xhr.addEventListener('loadstart', function(event) {
                spinner.style.display = "block";
            }, false);

            xhr.open('GET', 'https://api.github.com/search/users?q=' + query + '&access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                spinner.style.display = "none";
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                } else if (response.status == 404) {
                    // ничего не найдено
                }

            }, false);



            xhr.addEventListener('error', function(event) {

                // показать ошибку и попросить перезагрузить страницу

            }, false);

        },
        getInfo: function(userId, callback) {

            var xhr = new XMLHttpRequest();

            xhr.addEventListener('loadstart', function(event) {
                spinner.style.display = "block";
            }, false);

            xhr.open('GET', 'https://api.github.com/user/' + userId + '?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
            xhr.send(null);
            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                } else if (response.status == 404) {
                    //ничего не найдено
                }

            }, false);

            xhr.addEventListener('error', function(event) {

                // показать ошибку и попросить перезагрузить страницу

            }, false);


        },
        getRepositories: function(userId, callback) {
            var xhr = new XMLHttpRequest();

            xhr.addEventListener('loadstart', function(event) {
                spinner.style.display = "block";
            }, false);


            xhr.open('GET', 'https://api.github.com/user/' + userId + '/repos?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                } else if (response.status == 404) {
                    // ничего не найдено
                }

            }, false);

            xhr.addEventListener('error', function(event) {

                // показать ошибку и попросить перезагрузить страницу

            }, false);


        },
        getFollowers: function(userId, callback) {
            var xhr = new XMLHttpRequest();

            xhr.addEventListener('loadstart', function(event) {
                spinner.style.display = "block";
            }, false);

            xhr.open('GET', 'https://api.github.com/user/' + userId + '/followers?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));

                } else if (response.status == 404) {
                    // ничего не найдено
                }

            }, false);

            xhr.addEventListener('error', function(event) {

                // показать ошибку и попросить перезагрузить страницу

            }, false);


        },
        getFollowings: function(userId, callback) {
            var xhr = new XMLHttpRequest();

            xhr.addEventListener('loadstart', function(event) {
                spinner.style.display = "block";
            }, false);

            xhr.open('GET', 'https://api.github.com/user/' + userId + '/following?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {

                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));

                } else if (response.status == 404) {
                    // ничего не найдено
                }

            }, false);


            xhr.addEventListener('error', function(event) {

                // показать ошибку и попросить перезагрузить страницу

            }, false);

        }
    };
})();