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



/* Контроллер для поиска пользователей */
function SearchController(state) {
    document.title = 'Поиск пользователей';

    this.templatePath = '/templates/search.html';

    this.initListeners = function() {

        var searchArea = document.getElementById('searchArea');
        var searchInput = document.getElementById('searchInput');
        var searchPlaceholder = document.getElementById('searchPlaceholder');
        var notFoundBlock = document.getElementById('resultNotFound');


        searchInput.addEventListener('keyup', function(event) {
            var _self = this;
            if (_self.value.length >= 3) {
                setTimeout(function() {
                    Users.find(_self.value, function(data) {

                        if (data.length == 0) {
                            searchPlaceholder.style.display = "none";
                            notFoundBlock.style.display = "block";
                            searchArea.style.display = "none";
                        } else {
                            searchPlaceholder.style.display = "none";
                            searchArea.style.display = "block";

                            var userList = document.createDocumentFragment();
                            var ul = document.createElement('ul');
                            var li = null;
                            var a = null;
                            ul.className = "search-results__result";
                            data.items.forEach(function(item) {
                                li = document.createElement('li');
                                a = document.createElement('a');
                                a.href = "#/profile/" + item.id + "/main";
                                a.className = 'search-results__link';
                                a.appendChild(document.createTextNode(item.login));
                                li.className = "search-results__item";
                                li.appendChild(a);
                                userList.appendChild(li);
                            });
                            ul.appendChild(userList);
                            searchArea.replaceChild(ul, searchArea.firstElementChild);
                        }



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
        }, false);

    };



}

SearchController.prototype = Object.create(BaseController.prototype);



/* Контроллер для вкладки с основной информацией */
function ProfileMainController(state) {
    document.title = 'Основная информация';

    this.templatePath = '/templates/profile_main.html';
    this.data = null;
    this.getData = function(callback) {
        Users.getInfo(RegExp.$1, callback);
    };


}
ProfileMainController.prototype = Object.create(BaseController.prototype);


/* Контроллер для вкладки с подписчиками */
function ProfileFollowersController(state) {
    document.title = 'Подписчики';

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
    document.title = 'Подписки';

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
    document.title = 'Репозитории';

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