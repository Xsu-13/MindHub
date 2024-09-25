import axios from "axios";

axios.defaults.withCredentials = true;

let domen = "https://localhost:5001";


//---------------USER----------------

export const LoginUser = async (email, password) => {
    var status = await fetchLogin(email, password) ?? "Что-то пошло не так."
    var user = status.data;
    return user; 
}

export const SignUpUser = async (username, email, password) => {
    var status = await fetchSignUp(username, email, password) ?? "Что-то пошло не так."
    // var user = status.data.user;
    // localStorage.setItem("user", JSON.stringify(user));
    return user; 
}

export const fetchLogin = async (email, password) => {
    try{
        return await axios.post(domen+"/api/users/login", {email: email, password: password})
    }
    catch(e)
    {
        console.log(e);
    }
}

export const fetchSignUp = async (username, email, password) => {
    try{
        return await axios.post(domen+"/api/users/signup", {username: username, email: email, password: password})
    }
    catch(e)
    {
        console.log(e);
    }
}

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
    var nodes = await fetchCreateNode(node) ?? "Что-то пошло не так."
    return nodes; 
}

export const fetchCreateNode = async (node) => {
    try{
        return await axios.post(domen+"/api/nodes", node)
    }
    catch(e)
    {
        console.log(e);
    }
}

export const PatchNode = async (nodeId, node) => {
    var nodes = await fetchPatchNode(nodeId, node) ?? "Что-то пошло не так."
    return nodes; 
}

export const fetchPatchNode = async (nodeId, patch) => {
    try{
        return await axios.patch(domen+"/api/nodes/"+nodeId, patch)
    }
    catch(e)
    {
        console.log(e);
    }
}

export const DeleteNode = async (nodeId) => {
    var nodes = await fetchDeleteMap(nodeId) ?? "Что-то пошло не так."
    return nodes; 
}

export const fetchDeleteNode = async (nodeId) => {
    try{
        return await axios.delete(domen+"/api/nodes/"+nodeId)
    }
    catch(e)
    {
        console.log(e);
    }
}