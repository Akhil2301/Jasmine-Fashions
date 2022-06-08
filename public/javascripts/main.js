


// var header = document.getElementById("sidebar");
// var btns = header.getElementsByTagNameNS("a");
// for (var i = 0; i < btns.length; i++) {
//   btns[i].addEventListener("click", function() {
//   var current = document.getElementsByClassName("active");
//   current[0].className = current[0].className.replace(" active", "");
//   this.className += " active";
//   });
// }



/* cart ajax */


function addtocart(proId){
   
  $.ajax({
     url:'/add-to-cart/'+proId,
     method:'get',
     success:(response)=>{
         if(response.status){
           let count=$('#cart-count').html()
           count=parseInt(count)+1
           
           $('#cart-count').html(count)
           
         }
     }
  })
  }

  /*cart ajaxe*/

function change(cartId,proId,userId,count){

    let quantity=parseInt(document.getElementById(proId).value)
    count=parseInt(count)
      $.ajax({
        url:'/change-product-quantity',
        data:{
          user:userId,
          cart:cartId, 
          product:proId,
          count:count,
          quantity:quantity
        },
        method:'post',
      
        success:(response)=>{
    
         if(response.removeProduct){
          
           location.reload(); 
    
         }else{
           
          //document.getElementById(proId).innerHTML=quantity+count
         // document.getElementById('total').innerHTML=response.total
        
          location.reload()
         }
        }
      })
    }





    