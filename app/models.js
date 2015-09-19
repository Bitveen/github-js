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