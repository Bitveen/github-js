var Users = (function() {
    return {
        find: function(query, callback) {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', 'https://api.github.com/search/users?q=' + query, true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {

                var response = event.target;
                if (response.status < 400) {
                    callback(JSON.parse(response.responseText));
                }

            }, false);

            xhr.addEventListener('loadstart', function() {}, false);
            xhr.addEventListener('error', function() {}, false);

        },
        getInfo: function(login, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login, true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                callback(JSON.parse(event.target.responseText));
            }, false);

            xhr.addEventListener('loadstart', function() {}, false);
            xhr.addEventListener('error', function() {}, false);


        },
        getRepositories: function(login, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login + '/repos', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                callback(JSON.parse(event.target.responseText));
            }, false);

            xhr.addEventListener('loadstart', function() {}, false);
            xhr.addEventListener('error', function() {}, false);

        },
        getFollowers: function(login, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login + '/followers', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                callback(JSON.parse(event.target.responseText));
            }, false);

            xhr.addEventListener('loadstart', function() {}, false);
            xhr.addEventListener('error', function() {}, false);
        },
        getFollowings: function(login, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + login + '/following', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                callback(JSON.parse(event.target.responseText));
            }, false);

            xhr.addEventListener('loadstart', function() {}, false);
            xhr.addEventListener('error', function() {}, false);
        }
    };
})();







var Application = (function() {

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
                a.appendChild(document.createTextNode(user.name));
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

    return {
        init: function() {

            if (!location.hash) {
                location.hash = '#/';
            }



            window.addEventListener('hashchange', function(event) {
                console.log('Change');
                //изменяем представления и загружаем контроллеры
                var profilePatternMain = /#\/profile\/([a-zA-z0-9]+)\/main/;
                var profilePatternFollowers = /#\/profile\/([a-zA-z0-9]+)\/followers/;
                var profilePatternFollowings = /#\/profile\/([a-zA-z0-9]+)\/followings/;
                var profilePatternRepositories = /#\/profile\/([a-zA-z0-9]+)\/repositories/;


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
                            makeUserList([
                                {name: 'Max', login: 'max'},
                                {name: 'John', login: 'john'},
                                {name: 'Jack', login: 'jack'}
                            ]);
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
                            makeUserList([
                                {name: 'Max', login: 'max'},
                                {name: 'John', login: 'john'},
                                {name: 'Jack', login: 'jack'}
                            ]);

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
                                var fragment = document.createDocumentFragment();
                                var ul = document.createElement('ul');
                                var li = null;
                                data.forEach(function(item) {
                                    li = document.createElement('li');
                                    li.appendChild(document.createTextNode(item.name));
                                    fragment.appendChild(li);
                                });
                                ul.appendChild(fragment);
                                repositoriesContainer.appendChild(ul);

                            } else {
                                var p = document.createElement('p');
                                p.className = 'profile-content__repositories-empty';
                                repositoriesContainer.appendChild(p.appendChild(document.createTextNode('Репозитории отсутствуют.')));
                            }



                        });
                    });



                }
            }, false);
        }
    };
})();

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


function SearchController() {






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


function ProfileController() {}
ProfileController.prototype = Object.create(BaseController.prototype);




window.addEventListener('load', function(event) {
    Application.init();
}, false);




