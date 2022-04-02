//-- Getting Public IP
const get_PublicIP = async function () {
    //-- Container to hold results
    let PublicIP = {}
    try{
        const response = await fetch("https://ipinfo.io/json?token=5ab2f0f1e50427");
        //-- if success to getting this info        
        
        if (response.ok) {
            const results = await response.json()
                .then(data => { PublicIP = data })
                .catch(err => { console.log(err) });
                
            return response,PublicIP;
        } 
        else {
            return response;
        }
    }
    catch(err){
        console.log(err)
    }
};

//-- Exporting to share with script.js
export { get_PublicIP };