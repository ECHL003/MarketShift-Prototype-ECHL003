// Account Feature
if (window.location.pathname.includes("account.html")) {
    const setupPaymentBtn = document.getElementById("setupPaymentBtn");
    const viewPaymentBtn = document.getElementById("viewPaymentBtn");
    const listItemBtn = document.querySelector(".list-item-btn"); 
    const setupPaymentPopup = document.getElementById("setupPaymentPopup");
    const viewPaymentPopup = document.getElementById("viewPaymentPopup");
    const paymentDetailsPopup = document.getElementById("paymentDetailsPopup");

    const popupCloseButtons = document.querySelectorAll(".popup-close");

    const showPopup = (popup) => {
        popup.style.display = "flex";
    };

    const hidePopup = (popup) => {
        popup.style.display = "none";
    };

    setupPaymentBtn.addEventListener("click", () => {
        showPopup(setupPaymentPopup);
    });

    viewPaymentBtn.addEventListener("click", () => {
        showPopup(viewPaymentPopup);
    });

    popupCloseButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const popup = e.target.closest(".popup");
            hidePopup(popup);
        });
    });

    listItemBtn.addEventListener("click", () => {
        window.location.href = "listing.html";
    });

    [setupPaymentPopup, viewPaymentPopup, paymentDetailsPopup].forEach(popup => {
        popup.addEventListener("click", (e) => {
            if (e.target === popup) hidePopup(popup);
        });
    });
    
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfilePopup = document.getElementById('editProfilePopup');
    const editProfileForm = document.getElementById('editProfileForm');

    // Edit Profile Button Event Listener
    editProfileBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            alert('Please sign in to edit your profile');
            return;
        }

        try {
            const response = await fetch('/auth/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                document.getElementById('editPhone').value = data.user.PhoneNumber || '';
                document.getElementById('editAddress').value = data.user.Address || '';
                showPopup(editProfilePopup);
            } else {
                alert(data.message || 'Failed to load user details');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            alert('Error loading user details');
        }
    });

    // Form submission handler
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const phone = document.getElementById('editPhone').value;
        const address = document.getElementById('editAddress').value;
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch('/auth/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ phone, address })
            });

            if (response.ok) {
                alert('Profile updated successfully');
                hidePopup(editProfilePopup);
                
                // Force refresh the user data
                const userResponse = await fetch('/auth/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const userData = await userResponse.json();
                localStorage.setItem('user', JSON.stringify(userData.user));
                
                // Refresh the displayed info
                document.dispatchEvent(new Event('profileUpdated'));
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    });

    // Popup close handlers
    editProfilePopup.addEventListener("click", (e) => {
        if (e.target === editProfilePopup) hidePopup(editProfilePopup);
    });

    editProfilePopup.querySelector('.popup-close').addEventListener('click', () => {
        hidePopup(editProfilePopup);
    });

    
    document.querySelector('#setupPaymentPopup form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const cardNumber = document.getElementById('cardNumber').value;
        const expirationDate = document.getElementById('cardExpiry').value;
        const cvv = document.getElementById('cardCVV').value;
        const cardholderName = document.getElementById('cardName').value;

        const token = localStorage.getItem('authToken');

        try {
            // Fetch existing payment methods for the user
            const response = await fetch('/payment/view-payments', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                // Check if the payment method already exists
                const paymentMethods = data.paymentMethods;
                const isDuplicate = paymentMethods.some(method => method.CardNumber === cardNumber);

                if (isDuplicate) {
                    alert('This payment method already exists.');
                    return; // Stop further execution
                }

                // If not a duplicate, proceed to save the payment method
                const saveResponse = await fetch('/payment/save-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ cardNumber, expirationDate, cvv, cardholderName })
                });

                const saveData = await saveResponse.json();
                if (saveResponse.ok) {
                    alert('Payment method saved successfully');
                    hidePopup(setupPaymentPopup); // Close the pop-up after successful save
                } else {
                    alert(saveData.message);
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error saving payment method:', error);
        }
    });

    document.getElementById('viewPaymentBtn').addEventListener('click', async () => {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch('/payment/view-payments', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                // Display payment methods in the popup
                const paymentMethods = data.paymentMethods;
                const paymentMethodsContainer = document.getElementById('paymentMethodsContainer');
                paymentMethodsContainer.innerHTML = paymentMethods.map(method => `
                    <div class="payment-method">
                        <h2>Payment Method</h2>
                        <p><strong>Card Name:</strong> ${method.CardholderName}</p>
                        <p><strong>Card Number:</strong> **** **** **** ${method.CardNumber.slice(-4)}</p>
                        <p><strong>Expiration Date:</strong> ${method.ExpirationDate}</p>
                        <p><strong>Card CVV:</strong> ${method.CVV}</p>
                    </div>
                `).join('');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    });
    
    // View Listings Feature
    const viewListingsBtn = document.getElementById('viewListingsBtn');
    const viewListingsPopup = document.getElementById('viewListingsPopup');
    const listingsContainer = document.getElementById('listingsContainer');
    const closeListingsPopup = viewListingsPopup.querySelector('.popup-close');

    viewListingsBtn.addEventListener('click', function() {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            alert('Please sign in to view your listings');
            return;
        }
        
        fetch('/listing/listings/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            listingsContainer.innerHTML = '';
            
            if (data.listings && data.listings.length > 0) {
                data.listings.forEach(listing => {
                    const listingElement = document.createElement('div');
                    listingElement.className = 'listing-item';
                    
                    // Add out-of-stock class if needed
                    const statusClass = listing.status === 'Out of Stock' ? 'out-of-stock' : '';
                    
                    listingElement.innerHTML = `
                        <div class="listing-image">
                            <img src="/uploads/${listing.image}" alt="${listing.Name}">
                        </div>
                        <div class="listing-details">
                            <h3>${listing.Name}</h3>
                            <p>Price: $${listing.Price}</p>
                            <p>Category: ${listing.Category}</p>
                            <p>Shipping: $${listing.Shipping}</p>
                            <p class="status ${statusClass}">Status: ${listing.status}</p>
                            <p>Stock: ${listing.StockQuantity}</p>
                            <p>Date Listed: ${new Date(listing.created_at).toLocaleString()}</p>
                        </div>
                    `;
                    listingsContainer.appendChild(listingElement);
                });
            } else {
                listingsContainer.innerHTML = '<p>You have no listings yet.</p>';
            }
            
            viewListingsPopup.style.display = 'flex';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch listings');
        });
    });

    closeListingsPopup.addEventListener('click', function() {
        viewListingsPopup.style.display = 'none';
    });
    
    viewListingsPopup.addEventListener("click", (e) => {
        if (e.target === viewListingsPopup) hidePopup(viewListingsPopup);
    });

    // View Orders Feature
    const viewOrdersBtn = document.createElement("button");
    viewOrdersBtn.textContent = "View Orders";
    viewOrdersBtn.classList.add("account-btn");
    viewOrdersBtn.style.marginTop = "1rem";
    document.querySelector(".account-details").appendChild(viewOrdersBtn);

    const viewOrdersPopup = document.getElementById("viewOrdersPopup");
    const ordersListContainer = document.querySelector("#viewOrdersPopup .orders-list");

    viewOrdersBtn.addEventListener("click", () => {
        showPopup(viewOrdersPopup);
        displayOrders();
    });

    async function displayOrders() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                ordersListContainer.innerHTML = "<p>Please sign in to view your orders</p>";
                return;
            }

            const response = await fetch('/orders/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                const orders = data.orders || [];

                ordersListContainer.innerHTML = "";

                if (orders.length === 0) {
                    ordersListContainer.innerHTML = "<p>No orders found.</p>";
                    return;
                }

                orders.forEach(order => {
                    const orderItem = document.createElement("div");
                    orderItem.classList.add("order-item");
                    
                    // Convert TotalPrice to number if it's not already
                    const totalPrice = typeof order.TotalPrice === 'string' ? 
                        parseFloat(order.TotalPrice) : 
                        order.TotalPrice;
                    
                    // Add status-specific styling
                    let statusClass = '';
                    switch(order.Status.toLowerCase()) {
                        case 'processing':
                            statusClass = 'status-processing';
                            break;
                        case 'shipped':
                            statusClass = 'status-shipped';
                            break;
                        case 'delivered':
                            statusClass = 'status-delivered';
                            break;
                        default:
                            statusClass = 'status-default';
                    }
                    
                    orderItem.innerHTML = `
                        <div class="order-details">
                            <p><strong>Order ID:</strong> ${order.Transactionid}</p>
                            <p><strong>Date:</strong> ${new Date(order.Orderdate).toLocaleDateString()}</p>
                            <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
                            <p><strong>Items:</strong> ${order.TotalQuantity}</p>
                            <p><strong>Payment:</strong> **** **** **** ${order.CardNumber?.slice(-4) || 'N/A'}</p>
                            <div class="order-items">
                                ${order.items.map(item => {
                                    // Convert item total to number if needed
                                    const itemTotal = typeof item.total === 'string' ? 
                                        parseFloat(item.total) : 
                                        item.total;
                                    return `
                                        <div class="order-item-product">
                                            <img src="${item.image}" alt="${item.name}" width="50">
                                            <span>
                                                ${item.name} 
                                                (${item.quantity} × $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)})
                                            </span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        <div class="order-status ${statusClass}">${order.Status}</div>
                    `;
                    ordersListContainer.appendChild(orderItem);
                });
            } else {
                ordersListContainer.innerHTML = `<p>${data.message || "Failed to load orders"}</p>`;
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            ordersListContainer.innerHTML = "<p>Error loading orders</p>";
        }
    }

    let ordersRefreshInterval;

    viewOrdersBtn.addEventListener("click", () => {
        showPopup(viewOrdersPopup);
        displayOrders();
        // Refresh orders every 5 seconds while popup is open
        ordersRefreshInterval = setInterval(displayOrders, 5000);
    });

    document.querySelector("#viewOrdersPopup .popup-close").addEventListener("click", () => {
        hidePopup(viewOrdersPopup);
        clearInterval(ordersRefreshInterval);
    });

    viewOrdersPopup.addEventListener("click", (e) => {
        if (e.target === viewOrdersPopup) {
            hidePopup(viewOrdersPopup);
            clearInterval(ordersRefreshInterval);
        }
    });
}
