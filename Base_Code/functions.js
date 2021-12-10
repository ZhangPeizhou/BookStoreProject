//PeizhouZhang  101110707
//customer log in page
function customerLogIn(){
    window.location.href='/customerLogIn';
}
//owner log in page
function ownerLogIn(){
    window.location.href='/ownerLogIn';
}
//customer log in
function CLog(){
    let username=document.getElementById("username").value;
    let password=document.getElementById("password").value;
    let format={'username':username, 'password':password};
    console.log(username);
    console.log(password);
    console.log(format);
    let req=new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(this.readyState==4 && this.status==200){
            window.location.href='/CLogInFinalStep';
        }
    }
    req.open("POST", `/CLogIn`,true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(format));
    alert("Loging...")
}
//owner log in
function OLog(){
    let name=document.getElementById("username").value;
    let password=document.getElementById('password').value;
    let format={'name':name, 'password':password};
    let req=new XMLHttpRequest();
    req.onreadystatechange=function(){
        if(this.readyState==4&&this.status==200){
            window.location.href='/owner';
        }
    }
    req.open("POST", `/ownerLogIn`,true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert("loging...");
    //window.location.href='/owner';
}
//book searching function customer view
function CsearchBook(){
    let type=document.getElementById("type").value;
    if(type=="isbn"){type="book_id"}
    let value=document.getElementById("value").value;
    if(value.length==0){alert("Please Enter Condition")}
    else{
        if(type=="author_name" || type=="title" || type=="genre" || type=="publisher_name"){value=`'${value}'`}
        let format={"type":type, "value":value};
        console.log(format);
        let req=new XMLHttpRequest();
        req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                window.location.href='/CustomerBookResults'
            }
        }
        req.open("POST", `/searchBook`,true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert("Searching");
    }
}
//book searching function owner view
function OsearchBook(){
    let type=document.getElementById("type").value;
    if(type=="isbn"){type="book_id"}
    let value=document.getElementById("value").value;
    if(value.length==0){alert("Please Enter Condition")}
    else{
        if(type=="author_name" || type=="title" || type=="genre" || type=="publisher_name"){value=`'${value}'`}
        let format={"type":type, "value":value};
        console.log(format);
        let req=new XMLHttpRequest();
        req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                window.location.href='/OwnerBookResults'
            }
        }
        req.open("POST", `/searchBook`,true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert("Searching");
    }
}
//add new book to book store
function addBook(){
    window.location.href='/addBook'
}
function addToStore(){
    let book_id=document.getElementById("book_id").innerHTML;
    console.log(book_id);
    book_id=parseInt(book_id);
    let title=document.getElementById("title").value;
    let price=document.getElementById("price").value;
    let author=document.getElementById("author").value;
    let genre=document.getElementById("genre").value;
    let publisher=document.getElementById("publisher").value;
    let expense=document.getElementById('expense').value;
    let num_tot_bought=document.getElementById("num_tot_bought").value;
    let num_page=document.getElementById("num_page").value;
    let transfer=document.getElementById('transfer').value;
    if(title.length==0){alert('Please Enter Title')}
    else if(price.length==0){alert('Please Enter Price')}
    else if(author.length==0){alert('Please Enter Author')}
    else if(genre.length==0){alert('Please Enter Genre')}
    else if(publisher.length==0){alert('Please Enter Publisher')}
    else if(expense.length==0){alert('Please Enter Expense')}
    else if(num_tot_bought.length==0){alert('Please Enter How Many Books You Want To Buy')}
    else if(transfer.length==0){alert('Please Enter Transfer Rate')}
    else{
        let format={"book_id":book_id, "title":title, "price":price, "author":author, "genre":genre, "publisher":publisher, 
        "expense":expense, "num_tot_bought":num_tot_bought, "num_page":num_page, 'transfer':transfer};
        console.log(format);
        let req=new XMLHttpRequest();
        req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                window.location.href='/owner';
            }
        }
        req.open("POST", `/addToStore`,true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert("Added");
    }
}
//remove book
function removeBook(id){
    console.log(id);
    let format={"book_id": id};
    let req=new XMLHttpRequest();
        req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                window.location.href='/owner';
            }
        }
        req.open("POST", `/removeBook`,true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert("Removed");
}
//add book to basket
function addToBasket(id){
    console.log(id);
    let format={"book_id": id};
    let req=new XMLHttpRequest();
    req.onreadystatechange = function() {
	    if(this.readyState==4 && this.status==200){
            window.location.href='/customer';
        }
    }
    req.open("POST", `/addToBasket`,true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(format));
    alert("Added");
}
//go to input shiping information
function submitOrder(){
    window.location.href='/shiping';
}
//place order
function placeOrder(){
    let Saddress=document.getElementById("Saddress").value;
    let Baddress=document.getElementById("Baddress").value;
    let phone=document.getElementById("phone").value;
    let card=document.getElementById("card").value;
    let format={"Sa":Saddress, "Ba":Baddress, "Ph":phone, "Ca":card};
    let req=new XMLHttpRequest();
        req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                window.location.href='/customer';
            }
        }
        req.open("POST", `/placeOrder`,true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert("Order Placed");
}
//search order by id
function searchOrder(){
    let id=document.getElementById("orderID").value;
    if(id.length==0){alert("Please Enter Order ID")}
    else{
        let format={'id':id};
        let req=new XMLHttpRequest();
        req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                window.location.href='/orderResult';
            }
        }
        req.open("POST", `/searchOrder`,true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
    }
}
//sales vs expense
function seeReport(){
    let type=document.getElementById('report').value;
    let format={'ReportType': type};
    let req=new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(this.readyState==4 && this.status==200){
            window.location.href='/report';
        }
    }
    req.open("POST", `/report`,true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(format));
}
//customer registration page
function customerReg(){
    window.location.href='/Cregister';
}
//customer registration
function CReg(){
    let username=document.getElementById('username').value;
    let password=document.getElementById('password').value;
    let format={'username':username, 'password':password};
    let req=new XMLHttpRequest()
    req.onreadystatechange=function(){
        if(this.readyState==4&&this.status==200){
            window.location.href='/customer';
        }
    }
    req.open("POST", '/Cregister', true);
    req.setRequestHeader('Content-Type','application/json');
    req.send(JSON.stringify(format));
}
//owner registration page
function ownerReg(){
    window.location.href='/Oregister';
}
//customer registration
function OReg(){
    let username=document.getElementById('username').value;
    let password=document.getElementById('password').value;
    let phone=document.getElementById('phone').value;
    let format={'username':username, 'password':password, 'phone':phone};
    let req=new XMLHttpRequest()
    req.onreadystatechange=function(){
        if(this.readyState==4&&this.status==200){
            window.location.href='/owner';
        }
    }
    req.open("POST", '/Oregister', true);
    req.setRequestHeader('Content-Type','application/json');
    req.send(JSON.stringify(format));
}
//Add new author to database
function AddAuthor(){
    let name=document.getElementById('name').value;
    let phone=document.getElementById('phone').value;
    if(name.length==0){alert('Please Enter Author Name')}
    else{
        if(phone.length==0){phone=null}
        let format={'name':name, 'phone':phone};
        let req=new XMLHttpRequest()
        req.onreadystatechange=function(){
            if(this.readyState==4&&this.status==200){
                window.location.href='/addBook';
            }
        }
        req.open("POST", '/addauthor', true);
        req.setRequestHeader('Content-Type','application/json');
        req.send(JSON.stringify(format));
    }
}
function AddPublisher(){
    let name=document.getElementById('name').value;
    let phone=document.getElementById('phone').value;
    let address=document.getElementById('address').value;
    let email=document.getElementById('email').value;
    let bank=document.getElementById('bank').value;
    if(name.length==0){alert('Please Enter Publisher Name')}
    else if(bank.length==0){alert('Please Enter Bank Account')}
    else{
        if(phone.length==0){phone=null}
        if(address.length==0){address=null}
        if(email.length==0){email=null}
        let format={'name':name, 'phone':phone, 'email':email, 'address':address, 'bank':bank};
        let req=new XMLHttpRequest()
        req.onreadystatechange=function(){
            if(this.readyState==4&&this.status==200){
                window.location.href='/addBook';
            }
        }
        req.open("POST", '/addpublisher', true);
        req.setRequestHeader('Content-Type','application/json');
        req.send(JSON.stringify(format));
    }
}