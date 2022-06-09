const express = require('express');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');
const userHelper = require('../helpers/user-helpers');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const { response } = require('express');
var objectId = require('mongodb').ObjectId
const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({extended: false})


const accountSid = "AC55b870c0d8c96e1ff76e84c585db02db";
const authToken = "9350f3667aae4dda008d253621e91c50";
const serviceid = "VA8c4913d5591c069a8a6d6d49bbf7162c";
const client = require('twilio')(accountSid, authToken);


const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/')
    }
}

const cartcnt = (req, res, next) => {
    let user = req.session.user
    let cartCount = null;
    if (req.session.loggedIn) {
        userHelper.getCartCount(req.session.user._id).then((response) => {

            req.session.cartCount = response
            next();
        })
    } else {
        res.redirect('/login')
    }
}

// const profilevalaidation = async (req, res) => {
//     let userid = req.session.user._id
//     let user = await userHelper.userDetail(userid);


//     if (req.session.loggedIn) {
//          next();
//     } else {
//         res.redirect('/login')
//     }


// }


/* GET users listing. */
router.get('/', async function (req, res) { // console.log(req.body._id)
    cartCount = null
    if (req.session.loggedIn) {
        cartCount = await userHelper.getCartCount(req.session.user._id)
    }

    productHelpers.viewproduct().then(product => {
        if (req.session.user) {
            let a = product

            res.render('user/index', {a, cartCount, user: req.session.user});

        } else if (! req.session.admin) {
            let a = product

            res.render('user/index', {a});

        }
    })


});

/*Get Login Page. */
router.get('/login', function (req, res) {
    try {
        if (req.session.user) {
            res.render('user/index', {user: req.session.user})
        } else {
            res.render('user/login');
        }
    } catch (error) {
        res.send("500")
    }


});

/*post login Page.*/
router.post('/login', function (req, res) {

    userHelper.doLogin(req.body).then((response) => {
        if (response.status) {

            req.session.user = response.user
            req.session.loggedIn = true
            // res.render('user/index',{user:req.session.user})
            res.redirect('/')

        } else {
            req.session.loggedErr = true
            req.session.loggedIn = false
            res.render('user/login', {err_msg: 'Enter the correct credential'})
        }
    })

});
/*Get Signup Page.*/
router.get('/signup', function (req, res) {
    if(req.query){
         referal_name=req.query.ref_name
    }
    else{
        referal_name="" 
    }
    
    res.render('user/signup',{referal_name});
});

/*Post Signup Page.*/
router.post('/signup', async (req, res) => {
   
    if (req.body.email != undefined && req.body.phone != undefined && req.body.fname != undefined && req.body.lname != undefined && req.body.phone != undefined && req.body.password != undefined) {
        let email = await userHelper.emailcheck(req.body)
        let phone = await userHelper.phonecheck(req.body)
        
        if (email.status && phone.status) {

            res.render('user/signup', {err_msg: 'User is already exist'})
        } else if (! email.status && ! phone.status) {

            client.verify.services(serviceid).verifications.create({
                    to: `+91${
                    req.body.phone
                }`,
                channel: 'sms'
            }).then(verification => res.render('user/otp', {name_body: req.body}));

        } else { // console.log('error')
            res.render('user/signup', {err_msg: 'User Already exist'})

        }


    } else {
        console.log('error')
        res.render('user/signup', {err_msg: 'Enter Every field Properly'})

    }


});


/*Post Signup Page.*/
router.post('/otp', async (req, res) => {

    client.verify.services(serviceid).verificationChecks.create({
            to: `+91${
            req.body.phone
        }`,
        code: req.body.OTP
    }).then((verification_check) => {
        userHelper.doSignup(req.body).then(async (response) => {
            if (response) {
                req.session.user = response;

                req.session.loggedIn = true;
                res.redirect('/')
            } else {
                req.session.loggedIn = false;
                res.redirect('/signup')
            }
        })
    }).catch((error) => {
        res.render('user/signup', {err_msg: "Invalid Otp ..!"})
    });

})

/****** logout page*******/

router.get('/logout', verifyLogin, (req, res, next) => {
    req.session.destroy()
    res.redirect('/')
})


router.get('/product-details/:id', verifyLogin, cartcnt, async (req, res, next) => {

    cartCount = req.session.cartCount
    let product = await productHelpers.getProductDetails(req.params.id)

    res.render('user/product-details', {
        product,
        user: req.session.user,
        cartCount
    });

})


router.get('/add-to-cart/:id', cartcnt, verifyLogin, (req, res) => {

    userHelper.addToCart(req.params.id, req.session.user._id).then(async (response) => { // res.redirect('/cart')
        cartCount = await userHelper.getCartCount(req.session.user._id)
        cartCount = req.session.cartCount
        res.json({status: true, cartCount})
    })

})


router.get('/cart', verifyLogin, cartcnt, async (req, res) => {
    cartCount = req.session.cartCount
    let user = req.session.user


    let products = await userHelper.getCartProducts(req.session.user._id)

    // couponccode=products[0].couponccode.toString()
    // console.log(products[0].couponccode)
    let coupon = await userHelper.getCartcoupondata(req.session.user._id)

    let totalamount = 0
    let checks = false

    // console.log(products)
    if (! products[0]) {
        totalamount = 0
        checks = true
    } else {
        totalamount = await userHelper.getTotalAmount(req.session.user._id)
        totalamtwithotcoupon = await userHelper.getTotalAmountWithoutCoupon(req.session.user._id)
        checks = false
    }
    // console.log(totalamount)

    let address = await userHelper.getAddress(req.session.user._id)
    res.render('user/cart', {
        products,
        users: req.session.user._id,
        checks,
        cartCount,
        user,
        totalamtwithotcoupon,
        totalamount,
        address,
        

    })

})


/*******************address form ********** */
router.get('/add-address', cartcnt, verifyLogin, async (req, res) => {
    let totalamount = await userHelper.getTotalAmount(req.session.user._id)
    res.render('user/add-address', {totalamount, cartCount, user: req.session.user});


})

/*******************adress form end ********** */

/*******************address form post ********** */
router.post('/add-address', cartcnt, verifyLogin, (req, res) => {

    userHelper.addadress(req.body).then(async (response) => {
        cartCount = req.session.cartCount
        let user = req.session.user
        let form1 = 'open'
        let products = await userHelper.getCartProducts(req.session.user._id)
        let totalamount = await userHelper.getTotalAmount(req.session.user._id)

        let address = await userHelper.getAddress(req.session.user._id)
        res.render('user/cart', {
            products,
            users: req.session.user._id,
            cartCount,
            user,
            totalamount,
            address,
            form1
        })
    })


})

/*******************adress form end ********** */

/*******************Change product quantity********** */
router.post('/change-product-quantity', verifyLogin, cartcnt, async (req, res, next) => { // console.log("hhh")
    let productcount = await userHelper.productcount(req.body.cart)
    // console.log(productcount)
    userHelper.changeProductQuantity(req.body, productcount).then(async (response) => {
        response.totalamount = await userHelper.getTotalAmount(req.body.user)
        res.json(response)

    })
})


/*******************Remove product ********** */
router.post('/remove-product', verifyLogin, cartcnt, (req, res, next) => {

    userHelper.removeProduct(req.body).then((response) => {
        return new Promise((resolve, reject) => {
            res.json(response)
        })
    })
})

/*******************remove product  End ********** */

/*******************place order ********** */
router.post('/place-orders', verifyLogin, cartcnt, async (req, res) => {
    console.log(req.body.selectAddress)
    // const addressid=req.body.addressid
    cartCount = req.session.cartCount
    let totalamount = await userHelper.getTotalAmount(req.session.user._id)
    let address = await userHelper.getAddressbyid(req.body.selectAddress)

    address._id = address._id.toString()
    res.render('user/checkout', {
        totalamount,
        cartCount,
        user: req.session.user,
        address
    })


})

/*******************place order end ********** */


router.post('/place-order', verifyLogin, async (req, res) => {

    // let products = await userHelper.getCartProductList(req.body.userId)
    // let totalPrice = await userHelper.getTotalAmount(req.body.userId)
    // userHelper.placeOrder(req.body, products, totalPrice).then((response) => {
    //     return new Promise((resolve, reject) => {
    //         let orderId = response.insertedId
    //         req.session.orderId = orderId
    //         if (req.body['paymentMethod '] == 'COD') {
    //             res.json({codsuccess: true})
    //         } else if (req.body['paymentMethod'] == 'razorpay') {

    //             userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
    //                 res.json(response)

    //             })

    //         } else {
    //             userHelpers.generatePaypal(orderId, totalPrice).then((data) => {

    //                 response.data = data
    //                 response.paypal = true

    //                 res.json(response)


    //             })
    //         }

    //     })
    // })

    let products = await userHelper.getCartProductList(req.body.userId)
    let totalPrice = await userHelper.getTotalAmount(req.body.userId)
    orderrec = await userHelper.razorrecipt()
    // console.log(orderrec)
    // console.log(orderrec.receipt)
    // console.log(req.body.userId)
    // orderId=orderrec.receipt
    if (orderrec != undefined) {
        orderId = orderrec.receipt
        req.body.receipt = parseInt(orderId) + parseInt(1)
        // console.log(orderId +"ss")
    } else {
        orderId = 1
        req.body.receipt = parseInt(orderId)
    }
    // req.body.receipt=parseInt(orderId)+parseInt(1)
    // console.log(req.body.receipt)
    // console.log('hh')
    //    req.body['paymentMethod '] == 'COD'
    if (req.body.paymentMethod == 'COD') { // console.log(req.body)//return new Promise((resolve, reject) => {
        userHelper.placeOrder(req.body, products, totalPrice).then((response) => {
            res.json({codsuccess: true})
        })

    } else if (req.body.paymentMethod == 'razorpay') {

        userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
            response.data = req.body
            // console.log(response.data)
            res.json(response)


        })

    } else {
        userHelper.generatePaypal(products, totalPrice, req.body).then((response) => {
            // response.data = req.body
            // response.data = response

            // console.log(response.data)


            response.paypal = true

            // console.log('fine da')

            res.json(response)


        })
    }


})
router.get('/success/:id/:addressid', cartcnt, verifyLogin, async (req, res) => {
    // res.json(response)
    // console.log("hi paypal")
    let products = await userHelper.getCartProductList(req.params.id)
    let totalPrice = await userHelper.getTotalAmount(req.params.id)
    let address = await userHelper.getAddressbyid(req.params.addressid)
    let orderdata = req.query
    // console.log(orderdata)
    let order = {
        ... address,
        orderdata
    }
    // console.log(order)
    userHelper.placeOrderpaypal(order, products, totalPrice).then((response) => { // res.json({codsuccess: true})
        res.redirect('/order-success')
    })
    // console.log(req.params.id)
    // console.log(req.query)


})


router.get('/order-success', cartcnt, verifyLogin, (req, res) => {
    cartCount = req.session.cartCount
    res.render('user/order-success', {
        user: req.session.user,
        cartCount,
        status: 'ok'
    })
})

router.get('/orders', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let orders = await userHelper.getOrderList(req.session.user._id)
    console.log(req.session.user._id)
    res.render('user/order-success', {
        user: req.session.user,
        cartCount,
        orders,
        status: 'false'
    })
})


router.get('/userpage', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let address = await userHelper.getAddress(req.session.user._id)
    let user = await userHelper.getUsertDetails(req.session.user._id)
    res.render('user/userpage', {user, cartCount, address})
})
router.get('/Editprofie/:id', cartcnt, verifyLogin, async (req, res) => {

    cartCount = req.session.cartCount
    // let userDetail=await userHelper.getUsertDetails(req.params.id)
    let user = await userHelper.getUsertDetails(req.session.user._id)
    res.render('user/edit-profile', {user, cartCount});

})

router.post('/edit-profile/:pid', cartcnt, verifyLogin, (req, res) => {
    cartCount = req.session.cartCount


    userHelper.updateProfile(req.params.pid, req.body).then(async (response) => {

        // cartCount=req.session.cartCount
        // let address=await userHelper.getAddress(req.session.user._id)
        // let user=await userHelper.getUsertDetails(req.session.user._id)
        // res.render('user/userpage',{user,cartCount,address})

        res.redirect('/userpage')

    })
})


router.get('/cancel-order/:pid', cartcnt, verifyLogin, (req, res) => {

    userHelper.updateOrderStaus(req.params.pid).then(() => {
        res.redirect('/order-success')


    })
})


router.get('/changepassword', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let user = await userHelper.getUsertDetails(req.session.user._id)
    res.render('user/change-password', {
        user: user,
        cartCount
    })

})

router.get('/address', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let address = await userHelper.getAddress(req.session.user._id)
    res.render('user/address', {
        user: req.session.user,
        cartCount,
        address
    })

})

router.post('/changepassword', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    userHelper.chekChangePassword(req.session.user, req.body).then((response) => {
        if (response.status) {
            client.verify.services(serviceid).verifications.create({
                    to: `+91${
                    req.session.user.phone
                }`,
                channel: 'sms'
            }).then(verification => res.render('user/otp-changepass', {name_body: req.body}));
        } else {
            res.render('user/change-password', {err_msg: "Enter The Correct Data"})
        }

    }).catch((error) => {
        res.render('user/change-password', {err_msg: "Please Retry after sometimes"})
    })


})


router.post('/changepass', cartcnt, verifyLogin, (req, res) => {

    client.verify.services(serviceid).verificationChecks.create({
            to: `+91${
            req.session.user.phone
        }`,
        code: req.body.OTP
    }).then((verification_check) => {
        userHelper.changepass(req.body, req.session.user._id).then(async (response) => {
            // cartCount=req.session.cartCount
            // let address=await userHelper.getAddress(req.session.user._id)

            // res.render('user/userpage',{user:req.session.user,cartCount,address})
            res.redirect('/userpage')
        })
    })
})

router.post('/verify-payment', verifyLogin, cartcnt, async (req, res) => {
    // console.log(req.body)
    // console.log(req.body)
    let products = await userHelper.getCartProductList(req.body['order[data][userId]'])
    let totalPrice = await userHelper.getTotalAmount(req.body['order[data][userId]'])

    userHelper.verifyPayment(req.body).then(() => {

        // console.log(req.body)
        // console.log(req.body['order[data][userId]'])
        let data = req.body
        // console.log(req.body['order[data]'])
        userHelper.placeOrderrazor(data, products, totalPrice).then((response) => { // res.json({codsuccess: true})

            order_Id = response.insertedId
            userHelpers.changePaymentStatus(order_Id).then(() => {

                res.json({status: true})

            })

        })
    }).catch((err) => {
        console.log('eee' + err)
        res.json({status: false, err_msg: 'Some Error'})
    })
})

router.get('/crop-images/:id',verifyLogin, cartcnt, (req, res) => {
    cartCount = req.session.cartCount
    user = req.params.id
    res.render('user/crop-images', {
        crop: true,
        user,
        cartCount
    })
})

router.post('/crop-images', (req, res) => { // console.log("ggg")
    let user = req.body.user
    let image = req.body.image
    // console.log(req.body)
    userHelpers.profilePicChange(user, image).then(() => {
        res.redirect('/userpage')
    })
})


router.post('/applycoupon',cartcnt, verifyLogin, async (req, res) => { // console.log(req.body)
    let coupon = await userHelper.getCartcoupon(req.body.enteredcoupon)
    let coupondata=await userHelper.getCartcoupondata_use(req.body.userid)
 console.log(req.body.userid)
    if (coupon != undefined && coupondata==0 ) {

        userHelpers.checkUsedCoupon(req.body).then((response) => {
            if (response.status) {

                userHelpers.applyCoupon(req.body).then((response) => { // console.log(response);
                    res.json(response)
                })

            } else {
                res.json(response)

            }


        })
    

    }else if(coupondata.length>0){
        res.json({usedStatus:true})
    }
    
    
    else {
        res.json({status: false})
    }


})


router.post('/removeCoupon',cartcnt, verifyLogin, (req, res) => { // console.log((req.body));
    userHelpers.removeCoupon(req.body.userid, req.body.coupid).then(async (response) => {
        console.log('dd dff')
        userHelpers.removecoupnid(req.body.userid, req.body.coupid).then(async (response) => {
            res.json({status: true})
        })

    })
})


router.get('/referalcode',cartcnt, verifyLogin,async (req, res) => {
    cartCount = req.session.cartCount
    let referalamount=await productHelpers.refamount()
    console.log(referalamount)
    let user = await userHelper.getUsertDetails(req.session.user._id)
       res.render('user/referalcode', {
        user: user,
        cartCount,
        referalamount:referalamount
    })
})


router.post('/getcoupon',cartcnt, verifyLogin,async (req, res) => {
   // cartCount = req.session.cartCount
   
   let coupon = await userHelper.getCartcoupondata(req.body.userid)
   console.log(coupon)
   if (coupon){
    res.json(coupon)
   }
  else{
    res.json({status:true})
  }
   
})

module.exports = router;
