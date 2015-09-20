var Users = (function() {
    /* Закрытые методы и свойства */
    var currentUser = null;

    return {
        find: function(query, callback) {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', 'https://api.github.com/search/users?q=' + query + '&access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
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
            xhr.open('GET', 'https://api.github.com/user/' + userId + '?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
            xhr.send(null);
            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    currentUser = JSON.parse(response.responseText);
                    callback(currentUser);
                }

            }, false);

        },
        getRepositories: function(userId, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/user/' + userId + '/repos?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
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
            xhr.open('GET', 'https://api.github.com/user/' + userId + '/followers?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
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
            xhr.open('GET', 'https://api.github.com/user/' + userId + '/following?access_token=2eff9755ad1b7dc9d2426d1ebc69bd4cf5358aa6', true);
            xhr.send(null);

            xhr.addEventListener('load', function(event) {
                var response = event.target;
                if (response.status == 200) {
                    callback(JSON.parse(response.responseText));
                }
            }, false);

        },
        getCurrentUser: function() {
            return currentUser;
        }
    };
})();