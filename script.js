// Logika Pemilihan Tim Proyek (Branch & Bound)

// Preset nilai biaya default untuk mempermudah demo
const PRESETS = {
    small: [23, 14, 45, 12, 60, 31, 18, 55, 42, 27, 38, 50], // n=12
    medium: [23, 14, 45, 12, 60, 31, 18, 55, 42, 27, 38, 50, 19, 29, 34, 48, 62, 15], // n=18
    large: [23, 14, 45, 12, 60, 31, 18, 55, 42, 27, 38, 50, 19, 29, 34, 48, 62, 15, 70, 22, 17, 33, 41, 28] // n=24
};

// Inisialisasi awal saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    renderCandidateInputs();
    applyPreset('small'); // Default preset kecil (n=12)
});

function setupEventListeners() {
    document.getElementById("nInput").addEventListener("change", (e) => {
        let n = parseInt(e.target.value);
        if (isNaN(n) || n < 12) n = 12;
        e.target.value = n;
        renderCandidateInputs();
    });

    document.getElementById("kInput").addEventListener("change", (e) => {
        let k = parseInt(e.target.value);
        if (isNaN(k) || k < 5) k = 5;
        if (k > 10) k = 10;
        e.target.value = k;
    });

    document.getElementById("generateRandomBtn").addEventListener("click", generateRandomCosts);
    document.getElementById("solveBtn").addEventListener("click", solveProjectSelection);

    // Event listener untuk tombol preset
    document.querySelectorAll(".preset-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const size = e.target.dataset.size;
            applyPreset(size);
        });
    });
}

// Render input biaya kandidat secara dinamis di UI
function renderCandidateInputs() {
    const n = parseInt(document.getElementById("nInput").value);
    const container = document.getElementById("candidateInputsContainer");
    
    // Simpan nilai biaya saat ini agar tidak tereset saat mengubah ukuran n
    const currentCosts = [];
    const boxes = container.querySelectorAll(".candidate-input-box input");
    boxes.forEach(input => {
        currentCosts.push(parseInt(input.value) || 0);
    });

    container.innerHTML = "";
    for (let i = 0; i < n; i++) {
        const div = document.createElement("div");
        div.className = "candidate-input-box";
        
        const label = document.createElement("label");
        label.innerText = `Kandidat ${i + 1}`;
        
        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.id = `cost_${i}`;
        // Isi dengan nilai sebelumnya, atau preset default, atau default 10
        if (i < currentCosts.length) {
            input.value = currentCosts[i];
        } else {
            input.value = Math.floor(Math.random() * 50) + 15; // Random fallback
        }
        
        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    }
}

// Terapkan preset biaya
function applyPreset(size) {
    const presetValues = PRESETS[size];
    if (!presetValues) return;
    
    document.getElementById("nInput").value = presetValues.length;
    renderCandidateInputs();
    
    for (let i = 0; i < presetValues.length; i++) {
        const input = document.getElementById(`cost_${i}`);
        if (input) input.value = presetValues[i];
    }
}

// Generate nilai biaya acak
function generateRandomCosts() {
    const n = parseInt(document.getElementById("nInput").value);
    for (let i = 0; i < n; i++) {
        const input = document.getElementById(`cost_${i}`);
        if (input) {
            input.value = Math.floor(Math.random() * 80) + 10; // Biaya antara 10 s.d 89
        }
    }
}

// ==================== ALGORITMA BRANCH & BOUND ====================

function solveProjectSelection() {
    const nInputEl = document.getElementById("nInput");
    const kInputEl = document.getElementById("kInput");
    const budgetInputEl = document.getElementById("budgetInput");

    const n = parseInt(nInputEl.value);
    const k = parseInt(kInputEl.value);
    const budget = parseInt(budgetInputEl.value);

    const outputDiv = document.getElementById("outputArea");
    const resultArea = document.getElementById("resultArea");

    // Tampilkan panel hasil
    resultArea.style.display = "block";
    outputDiv.innerHTML = "";

    // Validasi input robust
    let errors = [];

    if (isNaN(budget) || budgetInputEl.value.trim() === "") {
        errors.push("Batas Anggaran Proyek (B) tidak boleh kosong.");
    } else if (budget < 0) {
        errors.push("Batas Anggaran Proyek (B) tidak boleh negatif.");
    }

    if (isNaN(n) || nInputEl.value.trim() === "") {
        errors.push("Ukuran Pool Calon (n) tidak boleh kosong.");
    } else if (n < 12) {
        errors.push("Ukuran Pool Calon (n) harus minimal 12.");
    }

    if (isNaN(k) || kInputEl.value.trim() === "") {
        errors.push("Ukuran Tim Pilihan (k) tidak boleh kosong.");
    } else if (k < 5 || k > 10) {
        errors.push("Ukuran Tim Pilihan (k) harus antara 5 dan 10.");
    }

    if (!isNaN(n) && !isNaN(k) && k > n) {
        errors.push("Ukuran Tim Pilihan (k) tidak boleh melebihi Ukuran Pool Calon (n).");
    }

    if (errors.length > 0) {
        outputDiv.innerHTML = `
            <div class="error-message">
                <strong>Kesalahan Validasi Input:</strong>
                <ul style="margin-left: 20px; margin-top: 5px;">
                    ${errors.map(err => `<li>${err}</li>`).join("")}
                </ul>
            </div>
        `;
        return;
    }

    // Ambil data biaya kandidat dari input
    const originalCandidates = [];
    for (let i = 0; i < n; i++) {
        const inputEl = document.getElementById(`cost_${i}`);
        const costVal = inputEl ? parseInt(inputEl.value) : NaN;
        originalCandidates.push({
            idx: i, // Indeks asli sebelum diurutkan
            name: `Kandidat ${i + 1}`,
            cost: isNaN(costVal) || costVal < 0 ? 10 : costVal
        });
    }

    // Urutkan kandidat berdasarkan biaya (sangat penting untuk optimasi & lower bound)
    const sortedCandidates = [...originalCandidates].sort((a, b) => a.cost - b.cost);

    const startTime = performance.now();

    // Helper untuk menghitung Lower Bound secara akademis
    function calculateLowerBound(cost, level, selectedCount, kVal, candidatesArr, nVal) {
        const elementsNeeded = kVal - selectedCount;
        if (elementsNeeded === 0) return cost;
        if (elementsNeeded < 0) return Infinity;
        const remainingInPool = nVal - (level + 1);
        if (remainingInPool < elementsNeeded) return Infinity;
        
        let lb = cost;
        for (let i = 0; i < elementsNeeded; i++) {
            lb += candidatesArr[level + 1 + i].cost;
        }
        return lb;
    }

    // 1. Cek Kelayakan Awal
    // Hitung biaya tim termurah yang mungkin terbentuk
    const cheapestCost = calculateLowerBound(0, -1, 0, k, sortedCandidates, n);

    if (cheapestCost > budget) {
        const elapsed = (performance.now() - startTime).toFixed(3);
        outputDiv.innerHTML = `
            <div class="error-message">
                <strong>Tidak Ada Solusi Layak!</strong><br>
                Biaya tim termurah yang bisa dibentuk dari ${k} orang adalah <strong>${cheapestCost}</strong>, 
                yang melebihi batas anggaran yang ditentukan sebesar <strong>${budget}</strong>.
            </div>
            <div class="metrics-flex">
                <div class="metric-box">
                    <div class="metric-val">${elapsed} ms</div>
                    <div class="metric-lbl">Waktu Eksekusi</div>
                </div>
                <div class="metric-box">
                    <div class="metric-val">1</div>
                    <div class="metric-lbl">Total Simpul</div>
                </div>
                <div class="metric-box">
                    <div class="metric-val">1</div>
                    <div class="metric-lbl">Simpul Dipangkas</div>
                </div>
            </div>
            
            <h3 style="margin-top:20px;">Ringkasan Proses Branch & Bound</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Simpul ID</th>
                            <th>Parent ID</th>
                            <th>Keputusan</th>
                            <th>Jumlah Anggota</th>
                            <th>Biaya Sekarang</th>
                            <th>Lower Bound</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>0</td>
                            <td>-</td>
                            <td>Mulai Pencarian (Root)</td>
                            <td>0 (-)</td>
                            <td>0</td>
                            <td>${cheapestCost}</td>
                            <td><span class="badge badge-pruned">Node []: PRUNED (Exceeds Budget)</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        return;
    }

    // 2. Jalankan Pencarian Branch & Bound (Best-First Search / Least-Cost Search)
    let nodesGenerated = 0;
    let nodesExpanded = 0;
    let nodesPruned = 0;
    let bestCost = Infinity;
    let bestTeam = null;

    // Log seluruh simpul yang dieksplorasi untuk dicetak
    const nodeTrace = [];

    // Definisikan struktur Node
    // level: indeks kandidat dalam array sortedCandidates yang baru saja dievaluasi
    const rootNode = {
        id: 0,
        level: -1,
        selected: [],
        cost: 0,
        lowerBound: cheapestCost, // Lower bound untuk root adalah jumlah k elemen termurah
        parentId: null,
        decision: "Mulai Pencarian (Root)",
        status: "Active"
    };

    // Priority Queue diwakili oleh array yang diurutkan
    const pq = [rootNode];
    nodeTrace.push(rootNode);

    while (pq.length > 0) {
        // Urutkan PQ berdasarkan lowerBound (Least-Cost Search)
        pq.sort((a, b) => a.lowerBound - b.lowerBound);
        
        // Ambil simpul dengan lowerBound terkecil
        const curr = pq.shift();

        // Jika lower bound simpul saat ini sudah lebih buruk daripada bestCost yang ditemukan,
        // kita bisa pangkas simpul ini dan semua simpul tersisa di PQ (karena PQ terurut menaik)
        if (curr.lowerBound >= bestCost) {
            const nodeRep = "Node [" + curr.selected.map(m => m.name.replace("Kandidat ", "K")).join(", ") + "]";
            curr.status = `${nodeRep}: PRUNED (LB [${curr.lowerBound}] >= Best Cost [${bestCost}])`;
            nodesPruned++;
            continue;
        }

        // Jika kita sudah memilih k orang, periksa apakah ini merupakan solusi yang lebih baik
        if (curr.selected.length === k) {
            if (curr.cost < bestCost && curr.cost <= budget) {
                bestCost = curr.cost;
                bestTeam = curr.selected;
                curr.status = "Solution Found";
            } else {
                const nodeRep = "Node [" + curr.selected.map(m => m.name.replace("Kandidat ", "K")).join(", ") + "]";
                curr.status = `${nodeRep}: PRUNED (LB [${curr.cost}] >= Best Cost [${bestCost}])`;
                nodesPruned++;
            }
            continue;
        }

        // Jika level sudah mencapai akhir dari kandidat tetapi belum mencapai ukuran k
        if (curr.level === n - 1) {
            const nodeRep = "Node [" + curr.selected.map(m => m.name.replace("Kandidat ", "K")).join(", ") + "]";
            curr.status = `${nodeRep}: PRUNED (Infeasible - Not enough candidates)`;
            nodesPruned++;
            continue;
        }

        // Ekspansi simpul
        nodesExpanded++;
        curr.status = "Expanded";
        const nextIdx = curr.level + 1;
        const nextCandidate = sortedCandidates[nextIdx];

        // --- CABANG 1: Pilih Kandidat `nextIdx` ---
        const newSelectedIn = [...curr.selected, nextCandidate];
        const newCostIn = curr.cost + nextCandidate.cost;
        const mIn = newSelectedIn.length;
        const lbIn = calculateLowerBound(newCostIn, nextIdx, mIn, k, sortedCandidates, n);
        
        nodesGenerated++;
        const childIn = {
            id: nodesGenerated,
            level: nextIdx,
            selected: newSelectedIn,
            cost: newCostIn,
            lowerBound: lbIn,
            parentId: curr.id,
            decision: `Pilih ${nextCandidate.name}`,
            status: "Active"
        };
        
        const nodeRepIn = "Node [" + newSelectedIn.map(m => m.name.replace("Kandidat ", "K")).join(", ") + "]";

        if (newCostIn > budget) {
            childIn.status = `${nodeRepIn}: PRUNED (Exceeds Budget)`;
            nodesPruned++;
        } else if (lbIn === Infinity) {
            childIn.status = `${nodeRepIn}: PRUNED (Infeasible - Not enough candidates)`;
            nodesPruned++;
        } else if (lbIn > budget) {
            childIn.status = `${nodeRepIn}: PRUNED (Exceeds Budget)`;
            nodesPruned++;
        } else if (lbIn >= bestCost) {
            childIn.status = `${nodeRepIn}: PRUNED (LB [${lbIn}] >= Best Cost [${bestCost}])`;
            nodesPruned++;
        } else {
            if (mIn === k) {
                bestCost = newCostIn;
                bestTeam = newSelectedIn;
                childIn.status = "Solution Found";
            } else {
                pq.push(childIn);
            }
        }
        nodeTrace.push(childIn);

        // --- CABANG 2: Lewati Kandidat `nextIdx` ---
        const newSelectedEx = [...curr.selected];
        const newCostEx = curr.cost;
        const mEx = newSelectedEx.length;
        const lbEx = calculateLowerBound(newCostEx, nextIdx, mEx, k, sortedCandidates, n);
        
        nodesGenerated++;
        const childEx = {
            id: nodesGenerated,
            level: nextIdx,
            selected: newSelectedEx,
            cost: newCostEx,
            lowerBound: lbEx,
            parentId: curr.id,
            decision: `Lewati ${nextCandidate.name}`,
            status: "Active"
        };
        
        const nodeRepEx = "Node [" + newSelectedEx.map(m => m.name.replace("Kandidat ", "K")).join(", ") + "]";

        if (newCostEx > budget) {
            childEx.status = `${nodeRepEx}: PRUNED (Exceeds Budget)`;
            nodesPruned++;
        } else if (lbEx === Infinity) {
            childEx.status = `${nodeRepEx}: PRUNED (Infeasible - Not enough candidates)`;
            nodesPruned++;
        } else if (lbEx > budget) {
            childEx.status = `${nodeRepEx}: PRUNED (Exceeds Budget)`;
            nodesPruned++;
        } else if (lbEx >= bestCost) {
            childEx.status = `${nodeRepEx}: PRUNED (LB [${lbEx}] >= Best Cost [${bestCost}])`;
            nodesPruned++;
        } else {
            if (mEx === k) {
                bestCost = newCostEx;
                bestTeam = newSelectedEx;
                childEx.status = "Solution Found";
            } else {
                pq.push(childEx);
            }
        }
        nodeTrace.push(childEx);
    }

    // Hitung waktu eksekusi
    const elapsed = (performance.now() - startTime).toFixed(3);

    // Perbarui status akhir dari simpul di jejak untuk visualisasi yang akurat
    nodeTrace.forEach(node => {
        if (node.status === "Active" && node.selected.length !== k) {
            const nodeRep = "Node [" + node.selected.map(m => m.name.replace("Kandidat ", "K")).join(", ") + "]";
            node.status = `${nodeRep}: PRUNED (LB [${node.lowerBound}] >= Best Cost [${bestCost}])`;
        }
        if (node.status === "Solution Found" && node.cost !== bestCost) {
            const nodeRep = "Node [" + node.selected.map(m => m.name.replace("Kandidat ", "K")).join(", ") + "]";
            node.status = `${nodeRep}: PRUNED (LB [${node.cost}] >= Best Cost [${bestCost}])`;
        }
    });

    // 3. Tampilkan Hasil Akhir ke UI
    renderResults(bestTeam, bestCost, elapsed, nodesGenerated + 1, nodesExpanded, nodesPruned, nodeTrace);
}

// Render hasil akhir dan tabel proses B&B ke dalam HTML
function renderResults(bestTeam, bestCost, elapsed, totalNodes, expandedNodes, prunedNodes, nodeTrace) {
    const outputDiv = document.getElementById("outputArea");

    let html = `
        <div class="result-header">
            <h3>Solusi Optimal Ditemukan!</h3>
            <p>Berhasil membentuk tim berisi <strong>${bestTeam.length} orang</strong> dengan total biaya minimal.</p>
        </div>
        
        <p><strong>Anggota Tim yang Terpilih:</strong></p>
        <ul class="result-list">
    `;

    // Urutkan tim yang terpilih berdasarkan indeks asli agar rapi
    const orderedTeam = [...bestTeam].sort((a, b) => a.idx - b.idx);
    
    orderedTeam.forEach(member => {
        html += `<li><strong>${member.name}</strong> - Biaya: <strong>${member.cost}</strong> (Urutan Asli: ${member.idx + 1})</li>`;
    });

    html += `
        </ul>
        <p style="font-size: 1.1rem; margin-top: 15px;">Total Biaya Optimal: <strong style="color: #2f855a; font-size:1.3rem;">${bestCost}</strong></p>
        
        <div class="metrics-flex">
            <div class="metric-box">
                <div class="metric-val">${elapsed} ms</div>
                <div class="metric-lbl">Waktu Eksekusi</div>
            </div>
            <div class="metric-box">
                <div class="metric-val">${totalNodes}</div>
                <div class="metric-lbl">Total Simpul Dibangkitkan</div>
            </div>
            <div class="metric-box">
                <div class="metric-val">${expandedNodes}</div>
                <div class="metric-lbl">Simpul Diekspansi</div>
            </div>
            <div class="metric-box">
                <div class="metric-val">${prunedNodes}</div>
                <div class="metric-lbl">Simpul Dipangkas</div>
            </div>
        </div>

        <h3 style="margin-top: 30px;">Ringkasan Proses Pencarian Branch & Bound</h3>
        <p style="font-size: 0.9rem; color: #666;">
            Tabel di bawah merangkum bagaimana simpul-simpul dalam status space tree dibuat, dihitung nilai batas bawah (Lower Bound)-nya, 
            dan dipangkas (pruned) untuk menyingkirkan opsi suboptimal secara efisien.
        </p>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Simpul ID</th>
                        <th>Parent ID</th>
                        <th>Keputusan</th>
                        <th>Jumlah Anggota</th>
                        <th>Biaya Sekarang</th>
                        <th>Lower Bound</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;

    nodeTrace.forEach(node => {
        let badgeClass = "badge-active";
        let displayStatus = node.status;

        if (node.status.includes("Solution")) {
            badgeClass = "badge-solution";
            displayStatus = "Solusi Layak";
        } else if (node.status.includes("Pruned") || node.status.includes("PRUNED") || node.status.includes("Not Explored")) {
            badgeClass = "badge-pruned";
        } else if (node.status.includes("Expanded")) {
            badgeClass = "badge-active";
            displayStatus = "Diekspansi";
        }

        const parentText = node.parentId === null ? "-" : node.parentId;
        const nameList = node.selected.map(m => m.name.replace("Kandidat ", "K")).join(", ");

        html += `
            <tr>
                <td><strong>${node.id}</strong></td>
                <td>${parentText}</td>
                <td>${node.decision}</td>
                <td>${node.selected.length} (${nameList ? nameList : "-"})</td>
                <td>${node.cost}</td>
                <td><strong>${node.lowerBound === Infinity ? "Infinity" : node.lowerBound}</strong></td>
                <td><span class="badge ${badgeClass}">${displayStatus}</span></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    outputDiv.innerHTML = html;
}
