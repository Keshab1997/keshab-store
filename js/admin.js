// --- ১. সিঙ্গেল প্রোডাক্ট আপলোড লজিক ---
const productForm = document.getElementById('addProductForm');

if(productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('pName').value;
        const price = document.getElementById('pPrice').value;
        const category = document.getElementById('pCategory').value;
        const image = document.getElementById('pImage').value;

        const btn = document.getElementById('uploadBtn');
        btn.innerText = "Uploading...";
        btn.disabled = true;

        // Supabase এ ডাটা পাঠানো
        const { data, error } = await supabase
            .from('products')
            .insert([
                { 
                    name: name, 
                    price: price, 
                    category: category, 
                    image_url: image 
                }
            ]);

        if (error) {
            console.error('Error:', error);
            alert("Error: " + error.message);
        } else {
            alert("Product Added Successfully! ✅");
            productForm.reset();
        }

        btn.innerText = "Upload Single Product";
        btn.disabled = false;
    });
}

// --- ২. বাল্ক (Excel/CSV) আপলোড লজিক ---
const bulkBtn = document.getElementById('bulkUploadBtn');
const fileInput = document.getElementById('csvFileInput');

if(bulkBtn) {
    bulkBtn.addEventListener('click', () => {
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select a CSV file first! 📁");
            return;
        }

        // PapaParse দিয়ে ফাইল পড়া শুরু
        Papa.parse(file, {
            header: true, 
            skipEmptyLines: true,
            complete: async function(results) {
                console.log("Data found:", results.data);

                // ডাটা আছে কিনা চেক করা
                if(results.data.length === 0) {
                    alert("File is empty or wrong format!");
                    return;
                }

                bulkBtn.innerText = "Uploading Bulk Data...";
                bulkBtn.disabled = true;
                
                // সব ডাটা একসাথে Supabase এ পাঠানো
                const { data, error } = await supabase
                    .from('products')
                    .insert(results.data);

                if (error) {
                    console.error("Error:", error);
                    alert("Error in Bulk Upload: " + error.message);
                } else {
                    alert("All " + results.data.length + " products uploaded successfully! 🎉");
                    fileInput.value = ""; 
                }
                
                bulkBtn.innerText = "Upload All From CSV";
                bulkBtn.disabled = false;
            },
            error: function(err) {
                alert("Error reading file: " + err.message);
            }
        });
    });
}