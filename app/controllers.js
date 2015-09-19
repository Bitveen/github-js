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