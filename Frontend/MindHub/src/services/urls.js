import axios from "axios";

axios.defaults.withCredentials = true;

let domen = "https://localhost:56648";

export const LoginUser = async (email, password) => {
    var status = await fetchLogin(email, password) ?? "Что-то пошло не так."
    var user = status.data;
    localStorage.setItem("user", JSON.stringify(user));
    return user; 
}

export const SignUpUser = async (username, email, password) => {
    var status = await fetchSignUp(username, email, password) ?? "Что-то пошло не так."
    var user = status.data.user;
    localStorage.setItem("user", JSON.stringify(user));
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