function BaseController() {
    this.currentPageTitle = document.getElementById('currentPageTitle');
    this.viewContainer = document.getElementById('viewContainer');
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
    document.title = 'Поиск пользователей';
    this.templatePath = '/templates/search.html';
    this.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;
    _self.loadTemplate(_self.templatePath, function(template) {
        _self.viewContainer.innerHTML = template;
        var searchArea        = document.getElementById('searchArea');
        var searchInput       = document.getElementById('searchInput');
        var searchPlaceholder = document.getElementById('searchPlaceholder');
        var notFoundBlock     = document.getElementById('resultNotFound');

        searchInput.addEventListener('keyup', function(event) {
            var self = this;
            if (self.value.length == 0) {
                searchPlaceholder.style.display = "block";
                searchArea.style.display = "none";
            } else {

                Users.find(self.value, function(usersData) {
                    if (usersData.items.length == 0) {
                        searchPlaceholder.style.display = "none";
                        notFoundBlock.style.display = "block";
                        searchArea.style.display = "none";
                    } else {
                        searchPlaceholder.style.display = "none";
                        searchArea.style.display = "block";
                        notFoundBlock.style.display = "none";
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
                        searchArea.replaceChild(ul, searchArea.firstElementChild);
                    }
                });
            }
        }, false);

    });


}
SearchController.prototype = Object.create(BaseController.prototype);


/* Контроллер для вкладки с основной информацией */
function ProfileMainController() {
    BaseController.call(this);
    var _self = this;

    document.title = 'Основная информация';
    this.templatePath = '/templates/profile_main.html';

    Users.getInfo(RegExp.$1, function(receivedData) {
        _self.data = receivedData;
        _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;
        _self.loadTemplate(_self.templatePath, function(template) {
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
    document.title = 'Подписчики';

    this.templatePath = '/templates/profile_followers.html';
    this.noDataText = 'Пользователи отсутствуют.';

    Users.getFollowers(RegExp.$1, function(followersList) {
        _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;
        _self.loadTemplate(_self.templatePath, function(template) {
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
    document.title = 'Подписки';
    var _self = this;

    this.templatePath = '/templates/profile_followings.html';

    this.noDataText = 'Пользователи отсутствуют.';

    Users.getFollowings(RegExp.$1, function(followingsList) {
        _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;
        _self.loadTemplate(_self.templatePath, function(template) {
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
    document.title = 'Репозитории';
    this.templatePath = '/templates/profile_repositories.html';
    this.noDataText = 'Репозитории отсутствуют.';

    Users.getRepositories(RegExp.$1, function(repositoriesList) {
        _self.currentPageTitle.innerHTML = StateManager.getCurrentState().Title;
        _self.loadTemplate(_self.templatePath, function(template) {
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
    document.title = 'Страница не найдена';
    _self.currentPageTitle.innerHTML = 'Страница не найдена.';
    this.templatePath = '/templates/not_found.html';
    _self.loadTemplate(_self.templatePath, function(template) {
        _self.viewContainer.innerHTML = template;
    });
}
NotFoundController.prototype = Object.create(BaseController.prototype);