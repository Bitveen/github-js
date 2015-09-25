'use strict';
/*  Основной модуль приложения, который запускает стейт хэндлер */
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


/* Для управления состояниями приложения: представления и логика.
   За логику и биндинг отвечают контроллеры совместно с моделями.
   Чтобы добавить новую страницу, нужно всего лишь описать ее в массиве states
*/
var StateManager = (function() {
    var currentState = null;
    var states = [
        {
            name: 'search',
            title: 'Поиск пользователей',
            pattern: /^#\/$/,
            controller: SearchController
        },
        {
            name: 'profile.main',
            title: 'Основная информация',
            pattern: /^#\/profile\/([0-9]+)\/main\/?$/,
            controller: ProfileMainController
        },
        {
            name: 'profile.followers',
            title: 'Подписчики',
            pattern: /^#\/profile\/([0-9]+)\/followers\/?$/,
            controller: ProfileFollowersController
        },
        {
            name: 'profile.followings',
            title: 'Подписки',
            pattern: /^#\/profile\/([0-9]+)\/followings\/?$/,
            controller: ProfileFollowingsController
        },
        {
            name: 'profile.repositories',
            title: 'Репозитории',
            pattern: /^#\/profile\/([0-9]+)\/repositories\/?$/,
            controller: ProfileRepositoriesController
        }
    ];

    // определение текущего стейта из доступных по хэшу
    var setCurrentState = function() {
        for (var i = 0; i < states.length; i++) {
            if (states[i].pattern.test(location.hash)) {
                currentState = states[i];
                break;
            }
            currentState = null;
        }
    };
    var stateHandler = function() {
        setCurrentState();
        if (currentState) {
            new currentState.controller(currentState);
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
    // шаблоны я храню в sessionStorage, потому что не хочу загрязнять кэш браузера
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

/* Мини-шаблонизатор */
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

/* Для вырисовки новых подгруженных элементов */
BaseController.prototype.addToUserList = function(userList) {

    var contentArea = document.querySelector('.users-list');
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
    contentArea.appendChild(fragment);
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


/* Для вырисовки новых подгруженных элементов */
BaseController.prototype.addToRepositoryList = function(repositoryList) {
    var repositoriesContainer = document.querySelector('.repository-list');
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


    /* чтобы не читать весь список существующий, ибо там может быть очень много элементов */
    var anchor = document.createElement('li');
    repositoriesContainer.appendChild(anchor);
    repositoriesContainer.lastElementChild.outerHTML = generatedList;


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
                self.searchArea.style.display        = "none";
                self.notFoundBlock.style.display     = "none";
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
        }, 600);



    }).bind(this);


    _self.loadTemplate(_self.templatePath, function(template) {
        document.title = 'Поиск пользователей';
        _self.currentPageTitle.innerHTML = StateManager.getCurrentState().title;

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
    var userId = RegExp.$1;

    this.templatePath = '/templates/profile_main.html';
    Users.getInfo(userId, function(receivedData) {
        _self.data = receivedData;

        _self.loadTemplate(_self.templatePath, function(template) {
            _self.spinner.style.display = 'none';
            document.title = 'Основная информация';
            _self.currentPageTitle.innerHTML = StateManager.getCurrentState().title;

            _self.viewContainer.innerHTML = _self.parseTemplate(template, {
                userId: userId,
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
    var userId = RegExp.$1;

    Users.getFollowers.page = null;


    this.templatePath = '/templates/profile_followers.html';
    this.noDataText = 'Пользователи отсутствуют.';

    Users.getFollowers(userId, function(followersList) {
        _self.loadTemplate(_self.templatePath, function(template) {
            _self.spinner.style.display = 'none';
            document.title = 'Подписчики';
            _self.currentPageTitle.innerHTML = StateManager.getCurrentState().title;

            _self.viewContainer.innerHTML = _self.parseTemplate(template, {
                userId: userId
            });
            if (followersList.length == 0) {
                _self.makeNoDataArea();
            } else {
                _self.makeUserList(followersList);
            }
            var linkHeader = Users.getLinkHeader('followers');
            if (linkHeader && linkHeader.split(', ')[0].indexOf('rel="next"') != -1) {
                // TODO: добавить кнопку подгрузки


                var buttonToInsert = document.createElement('a');
                buttonToInsert.href = '#';
                buttonToInsert.className = 'upload-button';
                buttonToInsert.innerHTML = 'Подгрузить';
                document.getElementById('contentArea').appendChild(buttonToInsert);

                buttonToInsert.addEventListener('click', function(event) {
                    event.preventDefault();
                    var nextLink = linkHeader.split(', ')[0];
                    Users.getFollowers(userId, function(additionalUsers) {
                        var linkHeader = Users.getLinkHeader('followers');
                        var nextExists = linkHeader.split(', ')[0].indexOf('rel="next"') != -1;

                        if (!linkHeader || !nextExists) {
                            buttonToInsert.parentNode.removeChild(buttonToInsert);
                        }
                        _self.addToUserList(additionalUsers);
                        _self.spinner.style.display = 'none';
                    })
                }, false);



            }
        });
    });


}
ProfileFollowersController.prototype = Object.create(BaseController.prototype);



/* Контроллер для вкладки с подписками */
function ProfileFollowingsController() {
    BaseController.call(this);

    Users.getFollowings.page = null;

    var _self = this;
    var userId = RegExp.$1;
    this.templatePath = '/templates/profile_followings.html';

    this.noDataText = 'Пользователи отсутствуют.';

    Users.getFollowings(userId, function(followingsList) {

        _self.loadTemplate(_self.templatePath, function(template) {
            _self.spinner.style.display = 'none';
            document.title = 'Подписки';
            _self.currentPageTitle.innerHTML = StateManager.getCurrentState().title;

            _self.viewContainer.innerHTML = _self.parseTemplate(template, {
                userId: userId
            });
            if (followingsList.length == 0) {
                _self.makeNoDataArea();
            } else {
                _self.makeUserList(followingsList);
            }
            var linkHeader = Users.getLinkHeader('followings');
            if (linkHeader && linkHeader.split(', ')[0].indexOf('rel="next"') != -1) {
                // TODO: добавить кнопку подгрузки


                var buttonToInsert = document.createElement('a');
                buttonToInsert.href = '#';
                buttonToInsert.className = 'upload-button';
                buttonToInsert.innerHTML = 'Подгрузить';
                document.getElementById('contentArea').appendChild(buttonToInsert);

                buttonToInsert.addEventListener('click', function(event) {
                    event.preventDefault();
                    var nextLink = linkHeader.split(', ')[0];
                    Users.getFollowings(userId, function(additionalUsers) {
                        var linkHeader = Users.getLinkHeader('followings');
                        var nextExists = linkHeader.split(', ')[0].indexOf('rel="next"') != -1;

                        if (!linkHeader || !nextExists) {
                            buttonToInsert.parentNode.removeChild(buttonToInsert);
                        }
                        _self.addToUserList(additionalUsers);
                        _self.spinner.style.display = 'none';
                    })
                }, false);



            }
        });
    });
}
ProfileFollowingsController.prototype = Object.create(BaseController.prototype);



/* Контроллер для вкладки с репозиториями */
function ProfileRepositoriesController() {
    BaseController.call(this);
    var _self = this;
    var userId = RegExp.$1;
    Users.getRepositories.page = null;

    this.templatePath = '/templates/profile_repositories.html';
    this.noDataText = 'Репозитории отсутствуют.';

    Users.getRepositories(userId, function(repositoriesList) {

        _self.loadTemplate(_self.templatePath, function(template) {
            _self.spinner.style.display = 'none';
            document.title = 'Репозитории';
            _self.currentPageTitle.innerHTML = StateManager.getCurrentState().title;

            _self.viewContainer.innerHTML = _self.parseTemplate(template, {
                userId: userId
            });
            if (repositoriesList.length == 0) {
                _self.makeNoDataArea();
            } else {
                _self.makeRepositoryList(repositoriesList);
            }
            var linkHeader = Users.getLinkHeader('repositories');
            if (linkHeader && linkHeader.split(', ')[0].indexOf('rel="next"') != -1) {
                // TODO: добавить кнопку подгрузки

                var buttonToInsert = document.createElement('a');
                buttonToInsert.href = '#';
                buttonToInsert.className = 'upload-button';
                buttonToInsert.innerHTML = 'Подгрузить';
                document.getElementById('contentArea').appendChild(buttonToInsert);

                buttonToInsert.addEventListener('click', function(event) {
                    event.preventDefault();
                    var nextLink = linkHeader.split(', ')[0];
                    Users.getRepositories(userId, function(additionalRepositories) {
                        var linkHeader = Users.getLinkHeader('repositories');
                        var nextExists = linkHeader.split(', ')[0].indexOf('rel="next"') != -1;

                        if (!linkHeader || !nextExists) {
                            buttonToInsert.parentNode.removeChild(buttonToInsert);
                        }
                        _self.addToRepositoryList(additionalRepositories);
                        _self.spinner.style.display = 'none';
                    })
                }, false);



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
    var linkHeaders = {
        repositories: null,
        followings: null,
        followers: null
    };
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
            var _self = this;

            if (!_self.getRepositories.page) {
                _self.getRepositories.page = 1;
            }

            xhr.addEventListener('loadstart', function(event) {
                spinner.style.display = "block";
            }, false);

            xhr.open('GET', 'https://api.github.com/user/' + userId + '/repos?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6&page=' + _self.getRepositories.page, true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    _self.getRepositories.page += 1;
                    linkHeaders.repositories = response.getResponseHeader('Link');
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

            var _self = this;

            if (!_self.getFollowers.page) {
                _self.getFollowers.page = 1;
            }

            xhr.addEventListener('loadstart', function(event) {
                spinner.style.display = "block";
            }, false);

            xhr.open('GET', 'https://api.github.com/user/' + userId + '/followers?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6&page=' + _self.getFollowers.page, true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    _self.getFollowers.page += 1;
                    linkHeaders.followers = response.getResponseHeader('Link');
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

            var _self = this;

            if (!_self.getFollowings.page) {
                _self.getFollowings.page = 1;
            }

            xhr.addEventListener('loadstart', function(event) {
                spinner.style.display = "block";
            }, false);

            xhr.open('GET', 'https://api.github.com/user/' + userId + '/following?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6&page=' + _self.getFollowings.page, true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {

                var response = event.target;
                if (response.status == 200) {
                    _self.getFollowings.page += 1;
                    linkHeaders.followings = response.getResponseHeader('Link');
                    callback(JSON.parse(response.responseText));

                } else if (response.status == 404) {
                    // ничего не найдено
                }

            }, false);
            xhr.addEventListener('error', function(event) {

                // показать ошибку и попросить перезагрузить страницу

            }, false);

        },
        getLinkHeader: function(type) {
            return linkHeaders[type];
        },
        getLinkHeaders: function() {
            return linkHeaders;
        }
    };
})();