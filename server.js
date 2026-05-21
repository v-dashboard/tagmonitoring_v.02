async function loadData() {
    try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        allData = data;
        console.log('✅ Loaded', allData.length, 'tags from TiDB');
        return allData;
    } catch (err) {
        console.error('❌ Gagal load data:', err);
        showToast('Gagal konek ke database: ' + err.message, 'error');
        allData = [];
        return allData;
    }
}

async function saveData(tagData) {
    try {
        const response = await fetch('/api/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tagData)
        });
        const result = await response.json();
        if (result.success) {
            showToast('✅ Data tersimpan ke TiDB!', 'success');
            return true;
        }
        showToast('❌ Gagal menyimpan', 'error');
        return false;
    } catch (err) {
        console.error('Gagal save:', err);
        showToast('❌ Error: ' + err.message, 'error');
        return false;
    }
}

async function updateTag(tagId, updateData) {
    try {
        const response = await fetch(`/api/tags/${tagId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        const result = await response.json();
        if (result.success) {
            showToast('✅ DATA BERHASIL DIUPDATE', 'success');
            await refreshData();
            return true;
        }
        showToast('❌ GAGAL UPDATE', 'error');
        return false;
    } catch (err) {
        console.error('Gagal update:', err);
        showToast('❌ Error: ' + err.message, 'error');
        return false;
    }
}

// HAPUS atau KOMENTAR semua kode yang panggil localStorage!
// Cari dan hapus baris yang ada "localStorage.setItem" atau "localStorage.getItem"
