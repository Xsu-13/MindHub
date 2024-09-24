import axios from "axios";

axios.defaults.withCredentials = true;

let domen = "https://localhost:50265";


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