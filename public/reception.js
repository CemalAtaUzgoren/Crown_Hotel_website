let tableData = [
  {
    c_name: 1,
    r_no: 1,
    b_ref: 1,
    c_email: 2,
    checkin: 3,
    checkout: 4,
    b_cost: 23,
    r_class: 123123,
  },
];
let total = 0;

let pageSize = 15;
let currentPage = 1;
let pageTotal = 0;
let pageCount = 1;
let row = {}
function getTableData() {
  const searchKey = $("#reception-search-input").val();
  console.log(searchKey);
  axios
    // .get(`http://localhost:3000/getReceptionList/?key=${searchKey}`)
    .get(`http://localhost:3000/getReceptionList?key=${searchKey}`)
    .then((res) => {
      if (res.status === 200) {
        const { data } = res;
        console.log(data)
        const dataLength = data.data.length;
        pageTotal = dataLength;
        pageCount = Math.ceil(dataLength / pageSize);
        tableData = data.data;
        updateTableData(tableData);
      }
    });
}

function updateTableData(newData) {
  $("#reception-tbody").empty();
  $("#recepiton-pagination-ul").empty();
  for (
    let i = (currentPage - 1) * pageSize;
    i < Math.min(currentPage *pageSize , pageTotal );
    i++
  ) {
    let html = "";
    console.log(tableData[i].r_status)
    html += `<tr >
                <td style="text-align: center;">${tableData[i].c_name}</td>
                <td style="text-align: center;">${tableData[i].r_no}</td>
                <td style="text-align: center;">${tableData[i].b_ref}</td>
                <td style="text-align: center;"> ${tableData[i].c_email}</td>
                <td style="text-align: center;">${tableData[i].checkin.split('T')[0]}</td>
                <td style="text-align: center;">${tableData[i].checkout.split('T')[0]}</td>
                <td style="text-align: center;">${tableData[i].b_cost}</td>
                <td style="text-align: center;">${tableData[i].r_class}</td>
                <td style="text-align: center;">
                    <button id="dialog-checkin-btn" class="dialog-checkin-btn-${i}" style="cursor:pointer"  onclick="showModal('checkIn',${
                      tableData[i].b_cost},${tableData[i].b_ref},${tableData[i].r_no})" >CheckIn</button>
                    <button id="dialog-checkout-btn" class="dialog-checkout-btn-${i}"  style="cursor:pointer" disabled onclick="showModal('checkOut',${
                      tableData[i].b_cost},${tableData[i].b_ref},${tableData[i].r_no})">CheckOut</button>
                </td>
            <tr/>
            `;
    $("#reception-tbody").append(html);
    $(`.dialog-checkin-btn-${i}`).prop('disabled',!(tableData[i].r_status==='A'))
    $(`.dialog-checkout-btn-${i}`).prop('disabled',!(tableData[i].r_status==='C'))
  }
  for (let j = 0; j < pageCount; j++) {
    let pagination;
    if (currentPage === j + 1) {
      pagination = `
    <li class="page-item selected" onclick="changePage(${j + 1})">${j + 1}</li>
`;
    } else {
      pagination = `
    <li class="page-item" onclick="changePage(${j + 1})">${j + 1}</li>
`;
    }

    $("#recepiton-pagination-ul").append(pagination);
  }
  //   console.log(pagination)
}
function changePage(num) {
  currentPage = num;
  updateTableData();
}
function showModal(type, price,b_ref,r_no) {
  row = {
    b_ref,r_no
  }
  let modal;
  if (type === "checkIn") {
    modal = document.getElementById("checkinDialog");
  } else {
    modal = document.getElementById("checkoutDialog");
    document.getElementById(
      "dialog-price"
    ).innerHTML = `Total Cost :￡${price}`;
  }
  modal.style.display = "block";
}
function closeModal(type) {
  let modal;
  if (type === "checkIn") {
    modal = document.getElementById("checkinDialog");
    const btn1 = document.getElementById("dialog-checkin-btn");
    const btn2 = document.getElementById("dialog-checkout-btn");
    btn1.setAttribute("disabled", true);
    btn2.removeAttribute("disabled");
  } else {
    modal = document.getElementById("checkoutDialog");
    const btn1 = document.getElementById("dialog-checkin-btn");
    const btn2 = document.getElementById("dialog-checkout-btn");
    btn1.setAttribute("disabled", true);
    btn2.setAttribute("disabled", true);
  }
  modal.style.display = "none";
  confirm(type);
  location.reload();
}
function confirm(type) {
  axios
    .get(`http://localhost:3000/${type}?r_no=${row.r_no}`, {
      r_no: row.r_no,
    })
    .then((res) => {
      if (res.data.data) {
        // updateTableData();
      }
    });
}
(function () {
  getTableData();
})();
