import Axios  from "axios"
const requestUrl = 'http://114.116.17.145:8080';
Axios.interceptors.response.use(
    response => {
        return response.data
    }
)
export function mulRequest (requests) {
    return Axios.all(requests)
}
export function makeRequest(path, method = 'get', data = {}, params = {}, ctx) {
    return Axios({
        url: `${requestUrl}${path}`,
        method: method,
        timeout: 6000,
        data: data,
        params: params
    }).catch((error) => {});
}
export function deepClone(source) {
    if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'shallowClone');
    }
    var targetObj = source.constructor === Array ? [] : {};
    for (var keys in source) {
        if (source.hasOwnProperty(keys)) {
            if (source[keys] && typeof source[keys] === 'object') {
                targetObj[keys] = source[keys].constructor === Array ? [] : {};
                targetObj[keys] = deepClone(source[keys]); //递归      
            } else {
                targetObj[keys] = source[keys];
            }
        }
    }
    return targetObj;
}