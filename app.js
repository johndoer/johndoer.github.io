const main = document.querySelector('main')
const cart = document.querySelector('.cart')
const cartBtn = document.querySelector('#cartBtn')
const footer = document.querySelector('footer')


class Products{
	async getProducts(){
		try {
			let result = await fetch('products.json');
			let data = await result.json();
			let products = data.items;
			products = products.map(item => {
				const {title, price} = item.fields;
				const {id} = item.sys;
				const image = item.fields.image.fields.file.url;
				return {title, price, id, image}
			});
			return products;
		} catch (error){
			console.log(error);
		}
	};
}

document.addEventListener('DOMContentLoaded', () => {
	const products = new Products();
	
	// fetch datas
	products.getProducts().then(products =>  {		
		let result = '';
		products.forEach(product => {
			result += `
				<article class='product' style="background-image:url(${product.image})" data-id=${product.id}>
				</article>
			`	
		});
		main.innerHTML = result;	
	});
	
})

cartBtn.addEventListener('click', (e) => {
	if(cart.classList.contains('cart-open')) {cart.classList.remove('cart-open')} else {cart.classList.add('cart-open')}
})

main.addEventListener('click', (e) => {
	if(e.target.classList.contains('product')){
		cart.innerHTML+= `<div class='cart-item'>You clicked picture number ${e.target.dataset.id}</div>`
		footer.style.opacity = '1'
		setTimeout(() => footer.style.opacity = '0', 1500);
	}
})
