// модуль выполняетя после загрузки всех других модулей

import {version} from './settings';

// версия нужна для сброса старых переменных в хранилище
localStorage.setItem('version', version);