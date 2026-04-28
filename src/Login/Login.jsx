import React from 'react'
import axios from 'axios';
export default function Login(){
    const handlelogin=(event)=>{
        event.preventDefault();
        var username=document.getElementById("email").value 
        var password=document.getElementById("password").value
        var key={
            username:username,
            password:password
        }
        if(username===''){
            alert("Please Enter the Username")
        }
        else if(password==''){
            alert("Please Enter the Password")
        }
        else{
            axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/login`,key)
            .then((res)=>{
                sessionStorage.setItem("userId", res.data.id)
                sessionStorage.setItem("userRole", res.data.role)
                sessionStorage.setItem("userName", res.data.name)
                sessionStorage.setItem("userQues", res.data.question)
                sessionStorage.setItem("dockerPort", res.data.docker_port)
                sessionStorage.setItem("outputPort", res.data.output_port)

                if (res.data.token) {
                    sessionStorage.setItem("authToken", res.data.token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                }
                if(res.data.status==="success"){
                    var role=res.data.role;
                    var id=res.data.id;
                    var empNo =res.data.empNo;
                    if(role===1){
                        window.location.href=`/admin/dashboard`
                    }
                    else if(role===2){
                        window.location.href=`/admin/superadmin`
                    }
                    else if(role===3){
                        window.location.href=`/systemcheck/${id}`
                    }
                    else if(role===4){
                        window.location.href=`/guidelines/${id}/${empNo}`
                    }
                    else if(role===5){
                        window.location.href=`/systemcheck/${id}`
                    }
                }
                else if(res.data.status==="invalid_user"){
                    alert("Please check your password")
                }
                else if(res.data.status==="both_are_invalid"){
                    alert("Please check your username")
                }else if(res.data.status==="already_logged_in"){
                    alert("Already logged in and assessement Completed")
                }else{
                    alert("Please Contact Admin")
                }
            })
        }
      }
    return(
        <>
        <div className="px-40 flex items-center justify-center min-h-screen bg-gray-100">
          <div className="relative w-full max-w-md bg-white mt-10 p-8 rounded-2xl shadow-lg">
            {/* <div className="absolute -top-17 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-gray-100">
              <img src="/kggllogo.png" className="w- rounded-full" alt="Logo" />
            </div> */}
            <h2 className="text-2xl font-bold text-center text-gray-700 mt-12 mb-6">Sign In</h2>
            <form onSubmit={handlelogin} className="space-y-4">
              <div>
                <label className="block text-gray-600 font-medium">Email Id</label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-blue-500 hover:underline text-sm">Forgot Password?</a>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
        
              



              
              {/* <div className="container-fluid padd">
               
                    <div className="col-lg-6 p-5 mx-auto">
                        <div className='mx-auto ms-5 ps-5'>
                            <img src={kglogo} className='w-'/>
                            
                        </div>

                        <div className="col-lg-12 login-form">
                            <div className="col-lg-12 login-form">
                                <form onSubmit={handlelogin}>
                                    
                                    <div className="form-group">
                                        <label className="form-control-label mb-3 textcolor"><h4 className='font-weight-bold'>Email Id</h4></label>
                                        <input type="text" className="form-control" name="email" id="email"/>
                                    </div>
                                    <br/>
                                    <br/>
                                    <div className="form-group">
                                    <label className="form-control-label mb-3 textcolor"><h4 className='font-weight-bold'>Password</h4></label>
                                        <input type="password" className="form-control" name="password" id="password" />
                                    </div>
                                    <br/>
                                    
                                    <div className=" text-left d-flex ">
                                      
                                        <div className="ms-auto ">
                                            <a href="#">Forgot Password</a>
                                        </div>
                                    </div>
                                    <br/>
                                    <div className="col-lg-12">
                                            <button type="submit" className="btn btn-primary col-lg-12 col-12">Sign in</button>
                                        
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                           
                           
                           
                    </div> 
               
            </div> */}
            
            {/* <div className=" padd">
               
               <div className=" p-5 mx-auto">
                   <div className='mx-auto ms-5 ps-5'>
                       <img src={kglogo} className=' mx-auto'/>
                       
                   </div>

                   <div className=" login-form">
                       <div className=" login-form">
                           <form onSubmit={handlelogin}>
                               
                               <div className="form-group">
                                   <label className="form-control-label mb-3 textcolor"><h4 className='font-weight-bold'>Email Id</h4></label>
                                   <input type="text" className="form-control" name="email" id="email"/>
                               </div>
                               <br/>
                               <br/>
                               <div className="form-group">
                               <label className="form-control-label mb-3 textcolor"><h4 className='font-weight-bold'>Password</h4></label>
                                   <input type="password" className="form-control" name="password" id="password" />
                               </div>
                               <br/>
                               
                               <div className=" text-left d-flex ">
                                 
                                   <div className="ms-auto ">
                                       <a href="#">Forgot Password</a>
                                   </div>
                               </div>
                               <br/>
                               <div className="">
                                       <button type="submit" className="btn btn-primary ">Sign in</button>
                                   
                               </div>
                           </form>
                       </div>
                   </div>
                   
                      
                      
                      
               </div> 
          
       </div> */}
        {/* <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Your IP Address</h1>
      <button onClick={getIpAddress}>Get IP Address</button>
      {ip && <p>Your IP address is: {ip}</p>}
    </div> */}
     {/* <div className="App">
            <header className="App-header">
                <p>Your IP address is: {ip}</p>
            </header>
        </div> */}
        </>
    );
}