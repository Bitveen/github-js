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