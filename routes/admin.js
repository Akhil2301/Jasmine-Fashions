var express = require('express');
const {ObjectId} = require('mongodb');
const adminHelpers = require('../helpers/admin-helpers');
const productHelper = require('../helpers/product-helpers');
const multer=require('multer');

const WEEK_SECONDS = 7 * 24 * 60 * 60 * 1000;
const MONTH_SECONDS = 30 * 24 * 60 * 60 * 1000;
const YEAR_SECONDS = 365.25 * 24 * 60 * 60 * 1000;

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/uploads')
    },
    filename:function(req,file,cb){
        var ext=file.originalname.substr(file.originalname.lastIndexOf('.'))
        cb(null,file.fieldname+'-'+Date.now()+'new'+ext)
    }
});
const upload=multer({storage:storage})


var router = express.Router();


const verifyLogin = (req, res, next) => {
    if (req.session.loggedInadmin) {
        next();
    } else {
        res.redirect('/admin/')
    }
}


/* GET home page. */
router.get('/', async (req, res, next) =>{

    if (req.session.admin) {
        let totalorder= await adminHelpers.totalorder();
        let totalsale= await adminHelpers.totalsale()
        let todaysale= await adminHelpers.todaysale()
        let orderperday= await adminHelpers.orderperday()
       // console.log(todaysale)
        res.render('admin/index', {
           
            admins: true,
            admin: req.session.admin,
            ad_log:true,
            totalorder:totalorder,
            totalsale:totalsale,
            todaysale:todaysale,
            orderperday:orderperday
        });
    } else {

        res.render('admin/admin-log', {admins: true,ad_log:false});
    }
});

/*post login Page.*/
router.post('/', function (req, res, next) {

    adminHelpers.doLogin(req.body).then((response) => {
        if (response.status) {

            req.session.admin = response.admin

            req.session.loggedInadmin = true
            // res.render('user/index',{user:req.session.user})

            res.redirect('/admin/')


        } else {
            req.session.loggedErr = true
            req.session.loggedInadmin = false
            if (req.session.loggedInadmin) {
                res.redirect('/admin/')
            } else {
                res.render('admin/admin-log', {
                    admins: true,
                    err_msg: 'Enter the correct credential',
                    ad_log:false
                })
            }


        }
    })

});


/****** logout page*******/

router.get('/logout', verifyLogin, (req, res, next) => {
    req.session.destroy()
    res.redirect('/admin/')
})

/*******  Add category ****************/
router.get('/category', verifyLogin, async (req, res, next) => {

    let categorylist = await productHelper.viewcategory()
    let brandlist = await productHelper.viewbrand()
    let subcategorylist = await productHelper.viewsubcategory()


    res.render('admin/category', {
        admins: true,
        categorylist,
        subcategorylist,
        brandlist,
        admin: req.session.admin,
        ad_log:true
    })
})

/*******  Add category end ****************/


/*******  Add category post ****************/
router.post('/category', verifyLogin, (req, res) => {

    productHelper.Category(req.body).then((response) => {
        res.redirect('/admin/category')
    })
})
/*******  Add category post end ****************/

/*******  Edit category  ****************/
router.post('/edit-category/:id', verifyLogin, async (req, res) => {

    productHelper.updateCategory(req.params.id, req.body).then((response) => {
        res.redirect('/admin/category')
    })

})

/*******  Edit category  end ****************/
/*******  delete category  start ****************/

router.get('/delete-category/:id', verifyLogin, async (req, res) => {

    productHelper.deletecategory(req.params.id).then((response) => {

        res.redirect('/admin/category');

    })

})

/*******  delete category  end ****************/


/*******  Add Brand ****************/
router.post('/brand', verifyLogin, async (req, res) => {
    productHelper.Brand(req.body).then((response) => {
        res.redirect('/admin/category')
    })
})

/*******  Add Brand end ****************/

/*******  Edit brand  ****************/
router.post('/edit-brand/:id', verifyLogin, async (req, res) => {

    productHelper.updatebrand(req.params.id, req.body).then((response) => {
        res.redirect('/admin/category')
    })

})

/*******  Edit brand  end ****************/

/*******  delete category  start ****************/

router.get('/delete-brand/:id', verifyLogin, async (req, res) => {

    productHelper.deletebrand(req.params.id).then((response) => {

        res.redirect('/admin/category');

    })

})

/*******  delete category  end ****************/

/*******  Add Sub category ****************/
router.post('/subcategory', verifyLogin, async (req, res) => {
    req.body.catagoryId = ObjectId(req.body.catagoryId)

    productHelper.Subcategory(req.body).then((response) => {
        res.redirect('/admin/category')
    })
})

/*******  Edit sub category start ****************/


router.post('/edit-subcategory/:id', verifyLogin, async (req, res) => {
    //console.log(req.params.id)
   // console.log(req.body)
    productHelper.updatesubcategory(req.params.id, req.body).then((response) => {
        res.redirect('/admin/category')
    })

})

/*******  Edit sub  end ****************/

/*******  delete category  start ****************/

router.get('/delete-subcategory/:id', verifyLogin, async (req, res) => {

    productHelper.deletesubCategory(req.params.id).then((response) => {

        res.redirect('/admin/category');

    })

})

/*******  delete category  end ****************/


/************ View product *******/
router.get('/product', verifyLogin,async(req, res, next)=> {
    let categorylist = await productHelper.viewcategory()
    let brandlist = await productHelper.viewbrand()
    let subcategorylist = await productHelper.viewsubcategorylist()
   

    productHelper.viewproduct().then((products => {
        res.render('admin/product', {
            admins: true,
            categorylist,
            subcategorylist,
            brandlist,
            admin: req.session.admin,
            product:products,
            ad_log:true
        })
    })).catch((err) => {
        console.log(`error${err}`)
    })

});
router.post('/product',verifyLogin,upload.array('image',12),(req,res)=>{

    let arr=[]

    req.files.forEach(function(files,index,ar){     
  
      arr.push(req.files[index].filename)

    })

   productHelper.addProducts(req.body,arr).then(()=>{
     res.redirect('/admin/product')
     
   })
 
})


router.post('/edit-product/:id',verifyLogin,async(req,res)=>{  
   
     
    productHelper.updateProduct(req.params.id,req.body).then((response)=>{
        res.redirect('/admin/product')})
     
  
  })


  router.post('/edit-image/:id',verifyLogin,upload.array('images',12),(req,res)=>{
 
    let arr=[]
    req.files.forEach((files,index,array)=>{
    
      arr.push(req.files[index].filename)
    })
    console.log(req.params.id)
      productHelper.updateProductWithFiles(req.params.id,arr).then(()=>{

        res.redirect('/admin/product')
    
      })
  })


  router.get('/delete-product/:id', verifyLogin, async (req, res) => {

    productHelper.deleteproduct(req.params.id).then((response) => {

        res.redirect('/admin/product');

    })

})

router.get('/user',verifyLogin,(req,res)=>{

  
    adminHelpers.viewuser().then((userlist=>{    
    
         res.render('admin/user',{
            userlist,
            admin:req.session.admin,
            admins:true,
            ad_log:true
        })       
     
    })).catch((err)=>{
      console.log(`error${err}`)
    })
  
    
  })

  router.post('/edit-user/:pid',(req,res)=>{
  
    adminHelpers.updateUser(req.params.pid,req.body).then((response)=>{
      res.redirect('/admin/user');
  
    
    })
  })

  router.get('/delete-user/:id/:stat',(req,res)=>{
    let proid=req.params.id
    let status=req.params.stat
   console.log(status)
    
    adminHelpers.deleteUser(proid,status).then((response)=>{
      
      res.redirect('/admin/user');
     
    })
  })

  router.get('/order',verifyLogin,async(req,res)=>{

  
    let orders=await adminHelpers.getOrderList()
    
    res.render('admin/order',{admin: req.session.user,orders,admins:true,ad_log:true,})
  
  })
  
  
  router.post('/dispatch-order',(req,res)=>{  
  
    adminHelpers.updateOrderStaus(req.body).then(async(response)=>{    
      
      res.redirect('/admin/order') 
  
    
    })
  })
  
  router.get('/offer', verifyLogin, async(req, res) => {
  
    let categorylist = await productHelper.viewcategory()
    let brandlist = await productHelper.viewbrand()
    let subcategorylist = await productHelper.viewsubcategorylist()
   

    productHelper.viewproduct().then((products => {
        console.log(products)
        res.render('admin/offer', {
            admins: true,
            categorylist,
            subcategorylist,
            brandlist,
            admin: req.session.admin,
            product:products,
            ad_log:true
        })
    })).catch((err) => {
        console.log(`error${err}`)
    })
})
  

router.post('/offer/:id',(req,res)=>{  
  
    productHelper.updateOffer(req.body,req.params.id).then(async(response)=>{    
      
      res.redirect('/admin/offer') 
  
    
    })
  })
  

router.get('/Offer-remove/:id',(req,res)=>{
  
    productHelper.removeOffer(req.params.id).then(async(response)=>{    
      
        res.redirect('/admin/offer') 
    
      
      })

})  

router.get('/monthlyreport', verifyLogin, async(req, res)=>{
    
    let nowDate = new Date();
    let previousMonth = new Date(nowDate - MONTH_SECONDS)
    adminHelpers.getMonthReport(previousMonth).then((response) => {
      report = response
     res.render('admin/monthlyreport', { report, admin: req.session.admin,admins:true, ad_log:true })
    })
  })

  router.get('/weeklyreport', verifyLogin, async(req, res)=>{
    
    let nowDate = new Date();
    let previousweek = new Date(nowDate - WEEK_SECONDS)
    adminHelpers.getMonthReport(previousweek).then((response) => {
      report = response

     res.render('admin/weeklyreport', { report, admin: req.session.admin,admins:true , ad_log:true})
    })
  })


  router.get('/yearlyreport', verifyLogin, async(req, res)=>{
    
    let nowDate = new Date();
    let previousyear = new Date(nowDate - YEAR_SECONDS)
    adminHelpers.getMonthReport(previousweek).then((response) => {
      report = response

     res.render('admin/yearlyreport', { report, admin: req.session.admin,admins:true,ad_log:true })
    })
  })

  router.get('/dailyreport', verifyLogin, async(req, res)=>{
    
    
    let nowDate = new Date();
    
    adminHelpers.getdailyReport(nowDate).then((response) => {
      report = response

     res.render('admin/daywisereport', { report, admin: req.session.admin,admins:true,ad_log:true })
    })
  })

  router.post('/dailyreport', verifyLogin, async(req, res)=>{
    //console.log('hhh')
    //if (req.params.day1){}
    adminHelpers.getdailyReports(req.body.today).then((response) => {
    //   report = response
    var startDate = req.params.day1;
var endDate = req.params.day2;
    var report = response.filter(a => {
       
        var datess =a.dat >= startDate && a.dat <= endDate;
        
        return (a.dat >= startDate && a.dat <= endDate);
      });
 
     res.render('admin/daywisereport', { report, admin: req.session.admin,admins:true,ad_log:true })
    })
  })



  // ......................Coupon management.....................................

router.get('/coupon',verifyLogin, (req, res) => {
    adminHelpers.getCoupon().then((coupon) => {
      //console.log(coupon);
      res.render('admin/coupon', { admins: true, coupon ,admin: req.session.admin,activecoupon:true,ad_log:true})
    })
  
  })
  
  router.post('/addCoupon', verifyLogin,(req, res) => {
  
   // console.log(req.body);
    adminHelpers.addCouponToDataBase(req.body).then(() => {
      res.redirect('/admin/coupon')
    })
  })
  

  
  router.get('/delete-coupon/:id',verifyLogin,(req,res)=>{
    // console.log('params');
    // console.log(req.params);
    adminHelpers.deleteCoupon(req.params).then(()=>{
      res.redirect("/admin/coupon")
    })
  })
  
  router.post('/removeCoupon',verifyLogin, (req, res) => {
    console.log((req.body));
    adminHelpers.removeCoupon(req.body.userid).then((response) => {
      res.json(response)
    })
  })

  router.get('/categoryoff', verifyLogin, async (req, res, next) => {

    let categorylist = await productHelper.viewcategory()
    
    res.render('admin/categoryoff', {
        admins: true,
        categorylist,        
        admin: req.session.admin,
        ad_log:true
    })
})

router.post('/categoryoff/:id', verifyLogin, async (req, res, next) => {
 
  productHelper.updatecatOffer(req.body,req.params.id).then(async(response)=>{ 
    productHelper.updateProductamtcatoff(req.body,req.params.id).then(async(response)=>{
      res.redirect('/admin/categoryoff') 
    })   
   
  })
  
})


/* GET home page. */
router.get('/referalcode',verifyLogin, async (req, res, next) =>{

 let referalamount=await productHelper.refamount()
    
   
      res.render('admin/refferalgenerator', { 
          admins: true,
          admin: req.session.admin,
          ad_log:true,
          referalamount:referalamount
      });
 
});

// router.post('/refferelcode', verifyLogin, async (req, res) => {
 

//   productHelper.createReferalValue(req.body).then((response) =>{
//     res.redirect('/admin/referalcode')  
   
// })

  
  
// })

router.post('/refferelcode', verifyLogin, (req, res) => {

  productHelper.createReferalValue(req.body).then((response) => {
      res.redirect('/admin/referalcode')
  })
})
  
module.exports = router;
