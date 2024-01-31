class ProductGroupColor extends HTMLElement{
	constructor() {
		super();
		
        this.productWrapper = document.querySelector('.main-content');
        
		document.addEventListener('DOMContentLoaded', () => {
			this.addEventListener('click', (event) => {
				event.preventDefault();
			
				const optionHandle = event.currentTarget.getAttribute('data-url');
				this.getProduct(optionHandle);
				this.onVariantClick(event)
			});                
		});
	}

	onVariantClick(event){
		const optionsColor = this.productWrapper.querySelectorAll('option-color');
		optionsColor.forEach((item) => {
			item.querySelector('input[type=radio]').removeAttribute('checked');
		});
		const variantInputRadio = event.currentTarget.querySelector('input[type=radio]');
		variantInputRadio.setAttribute('checked', 'checked');
	}

	getProduct(query){
		fetch(`${ window.Shopify.routes.root }products/${ query }.js`)
			.then((response) => response.json())
			.then((product) => {
				this.renderProduct(product);
			}
		);
	}

	renderProduct(product){
		this.variantsJSON = document.getElementById('product_variants');
		this.variantsJSON.innerHTML = JSON.stringify(product.variants);

		const infos = {
			title: product.title,
			description: product.description
		}
        
        this.setInfosProduct(infos);
        this.setState(product);
        this.setPrice(product.price, product.compare_at_price || 0);
        if(product.variants[0].option1 !== 'Default Title'){
            this.setVariantsSize(product.variants);
        }
        this.setVariantSelect(product.variants);
        this.setImages(product.media, infos);
        theme.sections.register('product', theme.Product);
    }

    setPrice(price, compare){
		let self = this;
		const priceContainer = this.productWrapper.querySelector('.product-block--price');
        const priceMoney = this.formatPrice(price/100);

        if(compare === 0){
            priceContainer.querySelector('[data-product-price-wrap]').classList.add('hide');
            this.productWrapper.querySelector('[data-save-price]').classList.add('hide');
        }else{
            if(compare > 0 && compare > price){
                const comparePriceMoney = self.formatPrice(compare/100);
                priceContainer.querySelector('[data-compare-price]').innerHTML = comparePriceMoney;
                priceContainer.querySelector('[data-product-price-wrap]').classList.remove('hide');

                this.productWrapper.querySelector('[data-save-price]').innerHTML = self.formatPrice((compare - price)/100) + ' OFF';
                this.productWrapper.querySelector('[data-save-price]').classList.remove('hide');
            }
        }

        priceContainer.querySelector('[data-product-price]').innerHTML = priceMoney;
 
		if(self.productWrapper.querySelector('.price__parcel')){
			_updateInstallment();
		}

		function _updateInstallment(){
			const installmentWrapper = self.productWrapper.querySelector('.price__parcel');
			const minInstallment = window.installment.min;
			var qtdInstallment = window.installment.qtd;

			while (qtdInstallment >= 1) {
				const installment = (price/100) / qtdInstallment;
				if(installment >= minInstallment){
					const priceInstallment = self.formatPrice(installment);
					installmentWrapper.innerHTML = `${ qtdInstallment }x de ${ priceInstallment } sem juros`;
					return;
				}				
				qtdInstallment = --qtdInstallment;
			}
		}	
	}

	setImages(images, infos){
		let template = '';
		const galleryImages = this.productWrapper.querySelector('.product__main-photos .product-slideshow');
        
        var flkty = new Flickity('.product-slideshow');
        flkty.destroy();

		images.forEach((item, index) => {

            var srcImage;
            var class_hide = '';
            var video_template = '';
            if (item.media_type === 'external_video') {
                class_hide = 'hide';
                srcImage = item.preview_image.src;
                video_template = `
                    <div data-video-type="youtube" class="product__video-wrapper loaded video-interactable" data-video-style="muted" style="padding-bottom: 100%;">
                        <iframe id="ProductVideo-template--14592586383440__main-2" class="product__video" data-image-count="${ images.length }" data-video-type="youtube" data-video-style="muted" data-video-loop="true" data-video-id="${ item.external_id}" frameborder="0" allowfullscreen="1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" title="${ infos.title }" width="1280" height="720" src="https://www.youtube.com/embed/${ item.external_id }?autohide=0&amp;autoplay=false&amp;cc_load_policy=0&amp;controls=0&amp;fs=0&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;rel=0&amp;enablejsapi=1&amp;origin=http%3A%2F%2F127.0.0.1%3A9292&amp;widgetid=1" data-gtm-yt-inspected-11="true"></iframe>
                    </div>
                `
            } else {
                srcImage = item.src;
            }            
            
            let classSlideItem = index === 0 ? 'starting-slide is-selected' : 'secondary-slide';

			template += `
                <div class="product-main-slide ${ classSlideItem }" data-index="${ index }">
                    <div data-product-image-main class="product-image-main">
                        <div class="image-wrap ${ class_hide }" style="height: 0; padding-bottom: 100.0%;">
                            <image-element data-aos="image-fade-in" data-aos-offset="150" class="aos-init aos-animate">
                                <img src="${ srcImage }&amp;width=1080" width="" height="" class="photoswipe__image image-element" loading="eager" alt="${ infos.title }" 
                                srcset="${ srcImage }&amp;width=360 360w,${ srcImage }&amp;width=540 540w,${ srcImage }&amp;width=720 720w,${ srcImage }&amp;width=900  900w,${ srcImage }&amp;width=1080  1080w," 
                                data-photoswipe-src="${ srcImage }&amp;width=1800" 
                                data-photoswipe-width="2250" 
                                data-photoswipe-height="2250" 
                                data-index="${ index }" 
                                sizes="(min-width: 769px) 50vw, 75vw">
                            </image-element>

                            <button type="button" class="btn btn--body btn--circle js-photoswipe__zoom product__photo-zoom">
                                <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-search" viewBox="0 0 64 64"><title>icon-search</title><path d="M47.16 28.58A18.58 18.58 0 1 1 28.58 10a18.58 18.58 0 0 1 18.58 18.58ZM54 54 41.94 42"></path></svg>
                                <span class="icon__fallback-text">Fechar (Esc)</span>
                            </button>
                        </div>
                        ${ video_template }
                    </div>
                </div>
            </div>
            `
        });
            
        galleryImages.innerHTML = template;
        this.setImagesThumbs(images);
    } 

    setImagesThumbs(images){
        let template = '';
        const galleryImages = this.productWrapper.querySelector('.product__thumbs .product__thumbs--scroller');

		images.forEach((item, index) => {

            var srcImage;
            var videoIcon = '';
            if (item.media_type === 'external_video') {
                srcImage = item.preview_image.src;
                videoIcon = `
                    <span class="product__thumb-icon">
                        <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-play" viewBox="18.24 17.35 24.52 28.3"><path fill="#323232" d="M22.1 19.151v25.5l20.4-13.489-20.4-12.011z"></path></svg>
                    </span>                
                `
            } else {
                srcImage = item.src;
            }

			template += `
                <div class="product__thumb-item" data-index="${ index }">
                    <a href="${ srcImage }" data-product-thumb class="product__thumb" data-index="${ index }" data-id="${ item.id }">
                        <div class="image-wrap loaded" style="height: 0; padding-bottom: 100.0%;">
                            ${ videoIcon }
                            <image-element data-aos="image-fade-in" data-aos-offset="150" class="aos-init aos-animate">
                                <img src="${ srcImage }&amp;width=720" alt="Patins Dynamix Rose - 80mm ABEC-7" loading="eager" class="image-element" />
                            </image-element>
                        </div>
                    </a>
                </div>
            `
        });  
        
        galleryImages.innerHTML = template;       
    }

	setInfosProduct(infos){
		const productTitle = this.productWrapper.querySelector('.product-single__title');
		const productDescription = this.productWrapper.querySelector('.product-description');

		productTitle.innerHTML = infos.title;
		productDescription.innerHTML = infos.description;
	}

	setVariantsSize(variants){
		let template = '';
		const self = this;
		const optionSize = this.productWrapper.querySelector('[data-option-name=tamanho]');

		variants.forEach((item, index) => {
			template += `

                <div class="variant-input" data-option="${ item.option1 }" data-value="${ item.option1 }" data-sortindex="${ index }">
                    <input 
                        type="radio" 
                        form="AddToCartForm-template--14592586383440__main-${ item.option1 }" 
                        value="${ item.option1 }" 
                        data-index="option${ item.index }" 
                        name="Tamanho" 
                        data-variant="${ item.id}" 
                        class="" 
                        id="ProductSelect-template--14592586383440__main-${ item.option1 }">
                    <label for="ProductSelect-template--14592586383440__main-${ item.option1 }" class="variant__button-label">
                        <strong>${ item.option1 }</strong>
                    </label>
                </div>

			`
		});
		optionSize.innerHTML = template;

		setUnavailable(variants);
		setFirstAvailable(variants);
        onSizeClick();

		function setFirstAvailable(variants){
			const availables = variants.filter((item) => {
				if(item.available === true){
					return item
				}
			});

			const firstAvailable = availables[0].option1;
            optionSize.querySelector('input[type=radio][value="'+ firstAvailable +'"]').setAttribute('checked', 'checked');
			self.setVariantForm(availables[0].id);

            const isAvailable = firstAvailable ? true : false;
            self.toggleAvailableSubmit(isAvailable);            
		}        

		function setUnavailable(variants){
            const unavailables = variants.filter((item) => {
                if(item.available == false){
                    return item
                }
            })

            if(unavailables.length === 0) return;

            const optionSize = document.querySelectorAll('[data-option-name="tamanho"] .variant-input');
            
            optionSize.forEach((item) => {
                const optionValue = item.getAttribute('data-option');

                item.querySelector('input').classList.remove('disabled');
                item.querySelector('label').classList.remove('disabled');
        
                unavailables.forEach((available) => {
                    const availableValue = available.option1
                    if(optionValue === availableValue){
                        item.querySelector('input').classList.add('disabled');
                        item.querySelector('label').classList.add('disabled');
                    }
                });
            });      
		}        

        function onSizeClick(){
            const inputsRadioSize = optionSize.querySelectorAll('.variant-input');
            inputsRadioSize.forEach((item) => {
                item.addEventListener('click', (event) => {
                    const variant = Number(event.currentTarget.querySelector('input').getAttribute('data-variant'));
                    const variants = self.getVariantData();
    
                    const variantIsAvailable = variants.filter((item) => {
                        if(item.id === variant && item.available === true){
                            return item;
                        }
                    });

                    const isAvailable = variantIsAvailable.length > 0 ? true : false;
                    self.toggleAvailableSubmit(isAvailable);

                    self.setVariantForm(variant);
                });
            });
        }
	}

    toggleAvailableSubmit(isAvailable){
        const submitButton = this.productWrapper.querySelector('[data-add-to-cart]');

        if(isAvailable){
            submitButton.removeAttribute('disabled');
            submitButton.textContent = window.variantStrings.addToCart;
        } else {
            submitButton.setAttribute('disabled', 'disabled');
            submitButton.textContent = window.variantStrings.soldOut;
        }        
    }

	setVariantForm(variant){
		this.productWrapper.querySelector('[name=product-id]').value = variant;
        
        const productSelectOptions = this.productWrapper.querySelectorAll('[data-product-select] option');
        productSelectOptions.forEach((item) =>{
            item.removeAttribute('selected');
            if(parseInt(item.value) === variant){
                item.setAttribute('selected', 'selected');
            }
        });
	}

    setVariantSelect(variants){
        const productSelect = this.productWrapper.querySelector('[data-product-select]');
        productSelect.innerHTML = '';

        let template = '';
        variants.forEach((item) =>{
			template += `
                <option value="${ item.id }">${ item.title } - ${ this.formatPrice(item.price/100) }</option>
			`            
        }); 
        productSelect.innerHTML = template;


        const availables = variants.filter((item) => {
            if(item.available === true){
                return item
            }
        });

        const firstAvailable = availables[0].id;
        this.setVariantForm(firstAvailable);    
    }

	setState(product){
		window.history.replaceState(null, null, `/products/${ product.handle }`);
		document.title = product.title;
	}

    getVariantData() {
        this.variantData = JSON.parse(document.getElementById('product_variants').textContent);
        return this.variantData;
    }
    
    formatPrice(price){
        return new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(price);
    }     
}
customElements.define('option-color', ProductGroupColor);