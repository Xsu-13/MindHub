import axios from "axios";

axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let domen = "https://localhost:5001";

//---------------USER----------------

export const LoginUser = async (email, password) => {
    try {
        const response = await fetchLogin(email, password);
        const payload = response?.data ?? {};
        const accessToken = payload.accessToken ?? payload.token ?? null;
        const user = payload.user ?? (payload.id ? payload : null);

        if (accessToken && user) {
            localStorage.setItem('accessToken', accessToken);
            return { user, accessToken };
        }

        return { error: 'Не удалось авторизоваться. Некорректный ответ сервера.' };
    } catch (e) {
        return { error: getRusErrorMessage(e) };
    }
}

export const SignUpUser = async (username, email, password) => {
    try {
        const status = await fetchSignUp(username, email, password);
        return !!status;
    } catch (e) {
        console.log(getRusErrorMessage(e));
        return false;
    }
}

export const fetchLogin = async (email, password) => {
    return await axios.post(domen+"/api/users/login", {email: email, password: password});
}

export const fetchSignUp = async (username, email, password) => {
    return await axios.post(domen+"/api/users/signup", {username: username, email: email, password: password});
}

export const fetchLogout = async () => {
    try{
        return await axios.post(domen+"/api/users/logout")
    }
    catch(e)
    {
        console.log(e);
    }
}

const getRusErrorMessage = (error) => {
    const responseMessage = error?.response?.data?.message;
    if (responseMessage) {
        return responseMessage;
    }

    const status = error?.response?.status;
    if (status === 400) return 'Некорректные данные запроса.';
    if (status === 401) return 'Ошибка авторизации. Проверьте логин и пароль.';
    if (status === 403) return 'Недостаточно прав для выполнения операции.';
    if (status === 404) return 'Ресурс не найден.';
    if (status >= 500) return 'Ошибка сервера. Попробуйте позже.';

    return 'Что-то пошло не так. Проверьте подключение к интернету.';
};

//---------------MAP----------------

export const AddMap = async (map) => {
    var map = await fetchAddMap(map) ?? "Что-то пошло не так."
    return map; 
}

export const fetchAddMap = async (map) => {
    try{
        return await axios.post(domen+"/api/maps", map)
    }
    catch(e)
    {
        console.log(e);
    }
}

export const DeleteMap = async (mapId) => {
    var map = await fetchDeleteMap(mapId) ?? "Что-то пошло не так."
    return map; 
}

export const fetchDeleteMap = async (mapId) => {
    try{
        return await axios.delete(domen+"/api/maps/"+mapId)
    }
    catch(e)
    {
        console.log(e);
    }
}

export const PatchMap = async (mapId, map) => {
    var map = await fetchPatchMap(mapId, map) ?? "Что-то пошло не так."
    return map; 
}

export const fetchPatchMap = async (mapId, map) => {
    try{
        return await axios.patch(domen+"/api/maps/"+mapId, map)
    }
    catch(e)
    {
        console.log(e);
    }
}

export const GetMapsByUserId = async (userId) => {
    var maps = await fetchGetMaps(userId) ?? "Что-то пошло не так."
    return maps; 
}

export const fetchGetMaps = async (userId) => {
    try{
        return await axios.get(domen+"/api/maps/user/" + userId)
    }
    catch(e)
    {
        console.log(e);
    }
}

//---------------NODE----------------
export const GetNodeById = async (nodeId) => {
    var nodes = await fetchGetNode(nodeId) ?? "Что-то пошло не так."
    return nodes; 
}

export const fetchGetNode = async (nodeId) => {
    try{
        return await axios.get(domen+"/api/nodes/" + nodeId)
    }
    catch(e)
    {
        console.log(e);
    }
}

export const GetNodesByMapId = async (mapId) => {
    var nodes = await fetchGetNodes(mapId) ?? "Что-то пошло не так."
    return nodes; 
}

export const fetchGetNodes = async (mapId) => {
    try{
        return await axios.get(domen+"/api/nodes/map/" + mapId)
    }
    catch(e)
    {
        console.log(e);
    }
}

export const CreateNode = async (node) => {
    const response = await fetchCreateNode(node);
    if (!response || !response.data) {
        throw new Error('Ошибка создания узла: некорректный ответ сервера');
    }
    return response;
}

export const fetchCreateNode = async (node) => {
    try{
        return await axios.post(domen+"/api/nodes", node)
    }
    catch(e)
    {
        console.error('Ошибка при создании узла:', e);
        throw e;
    }
}

export const PatchNode = async (nodeId, node) => {
    const response = await fetchPatchNode(nodeId, node);
    if (!response) {
        throw new Error('Ошибка обновления узла: некорректный ответ сервера');
    }
    return response;
}

export const fetchPatchNode = async (nodeId, patch) => {
    try{
        return await axios.patch(domen+"/api/nodes/"+nodeId, patch)
    }
    catch(e)
    {
        console.error('Ошибка при обновлении узла', nodeId, ':', e);
        throw e;
    }
}

export const DeleteNode = async (nodeId) => {
    const response = await fetchDeleteNode(nodeId);
    if (!response) {
        throw new Error('Ошибка удаления узла: некорректный ответ сервера');
    }
    return response;
}

export const fetchDeleteNode = async (nodeId) => {
    try{
        return await axios.delete(domen+"/api/nodes/"+nodeId)
    }
    catch(e)
    {
        console.error('Ошибка при удалении узла', nodeId, ':', e);
        throw e;
    }
}

//---------------STYLE----------------
export const CreateStyle = async (style) => {
    var createdStyle = await fetchCreateStyle(style) ?? "Что-то пошло не так."
    return createdStyle;
}

export const fetchCreateStyle = async (style) => {
    try{
        return await axios.post(domen+"/api/styles", style)
    }
    catch(e)
    {
        console.log(e);
        throw e;
    }
}

export const PatchStyle = async (styleId, stylePatch) => {
    var style = await fetchPatchStyle(styleId, stylePatch) ?? "Что-то пошло не так."
    return style;
}

export const fetchPatchStyle = async (styleId, patch) => {
    try{
        return await axios.patch(domen+"/api/styles/"+styleId, patch)
    }
    catch(e)
    {
        console.log(e);
        throw e;
    }
}

//---------------INVITES----------------

export const CreateInvite = async (mapId, userId) => {
    var nodes = await fetchCreateInvite(mapId, userId) ?? "Что-то пошло не так."
    return nodes; 
}

export const fetchCreateInvite = async (mapId, userId) => {
    try{
        return await axios.post(domen+"/api/invites/map/"+ mapId+"/user/" + userId)
    }
    catch(e)
    {
        console.log(e);
    }
}

export const AcceptInvite = async (token) => {
    var nodes = await fetchAcceptInvite(token) ?? "Что-то пошло не так."
    return nodes; 
}

export const fetchAcceptInvite = async (token) => {
    try{
        let mapId = await axios.get(domen+"/api/invites/accept/"+token);
        console.log(mapId);
        return mapId;
    }
    catch(e)
    {
        console.log(e);
    }
}

//---------------AI ASSISTENT----------------

export const SendOpenRouterQuery = async (query, nodes, model = null) => {
    var result = await fetchSendOpenRouterQuery(query, nodes, model) ?? "Что-то пошло не так."
    return result; 
}

export const fetchSendOpenRouterQuery = async (query, nodes, model = null) => {
    try{
        const payload = { query: query, context: nodes };
        if (model) {
            payload.model = model;
        }
        return await axios.post(domen+"/api/openrouter/query", payload)
    }
    catch(e)
    {
        console.log(e);
    }
}