function validation(ev) {

    let fname = document.myform.fname.value;
    let lname = document.myform.lname.value;
    let email = document.myform.email.value;
    let phone = document.myform.phone.value;
    let password = document.myform.password.value;

    let count = 0

    if (fname == '' || ! fname.match(/[A-Za-z]$/)) {

        document.getElementById('errorfname').innerHTML = 'Enter the First name';
        count++
    }
    if (lname == '' || ! lname.match(/[A-Za-z]$/)) {

        document.getElementById('errorlname').innerHTML = 'Enter the Last name'
        count++
    }

    if (email == '' || ! email.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)) {
        document.getElementById('erroremail').innerHTML = 'Enter the vallid email'
        count++
    }

    if (phone == '' || ! phone.match(/^\d{10}$/)) {
        document.getElementById('errorphone').innerHTML = 'Enter the valid phone number'
        count++
    }

    if (password == '' || ! password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/)) {
        document.getElementById('errorpassword').innerHTML = 'ust contain at least one number and one uppercase and lowercase letter, and at least 4 or more characters'
        count++
    }
    if (count != 0) {
        return false
    }


}

// function validationprofile(ev){

//     let fnameedit=document.myforms.fname.value;
//     let lnameedit=document.myforms.lname.value;
//     let emailedit=document.myforms.email.value;
//     let phoneedit=document.myforms.phone.value;
//     // let passwordedit=document.myforms.password.value;
//    alert(fnameedit)
//     let countedit=0

//     if(fnameedit===''||!fnameedit.match(/[A-Za-z]$/)){
//         alert(fnameedit)
//         document.getElementById('errorfname').innerHTML='Enter the First name';
//         countedit++
//     }
//     if(lnameedit===''||!lnameedit.match(/[A-Za-z]$/)){

//         document.getElementById('errorlname').innerHTML='Enter the Last name'
//         countedit++
//     }

//     if(emailedit===''||!emailedit.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)){
//         document.getElementById('erroremail').innerHTML='Enter the vallid email'
//         countedit++
//     }

//     if(phoneedit===''||!phoneedit.match(/^\d{10}$/)){
//         document.getElementById('errorphone').innerHTML='Enter the valid phone number'
//         countedit++
//     }

//    if(countedit!=0){
//     ev.preventDefault()
//        return false
//    }


// }

// const submit = document.getElementById("submit");

// submit.addEventListener("click", validate);

function validate(e) {

    let fnamedata = document.myforms.fname.value;
    let lnamedata = document.myforms.lname.value;
    // let email = document.myforms.email.value;
    let phonedata = document.myforms.phone.value;
    let freq = 0;
    if (fnamedata === '' || ! fnamedata.match(/[A-Za-z]$/)) {

        document.getElementById('errorefname').innerHTML = 'Enter the First name';
        // valid =false;
        freq++
    }

    if (lnamedata == '' || ! lnamedata.match(/[A-Za-z]$/)) {

        document.getElementById('errorelname').innerHTML = 'Enter the last name';
        // valid =false;
        freq++
    }

    if (phonedata == '' || ! phonedata.match(/^\d{10}$/)) {
        document.getElementById('errorephone').innerHTML = 'Enter the valid phone number'
        freq++
    }
    if (freq != 0) {
        return false;
    }

}

function validateForm() {

   
    let oldpassword = document.changepass.password.value;
    let newpassword = document.changepass.npass.value;
    let confirmpassword = document.changepass.cpass.value;
    let count = 0
    if(newpassword==oldpassword){
        document.getElementById('errornewpassword').innerHTML='Enter A New Password'
        count++
    }

    if (newpassword == '' || ! newpassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/)) {
        document.getElementById('errornewpassword').innerHTML = 'Must contain at least one number and one uppercase and lowercase letter, and at least 4 or more characters'
        count++
    }

    if(newpassword!=confirmpassword){
        document.getElementById('errorconfirmpassword').innerHTML='Password Does not Match'
        count++
    }
    if (count != 0) {
        return false
    }
}
