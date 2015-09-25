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
