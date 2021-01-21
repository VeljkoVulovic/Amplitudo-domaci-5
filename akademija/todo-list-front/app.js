var zadaci = [];
var api_route = "http://localhost/akademija/todo-list/api";

function citajZadatke(){
    return $.ajax({
        type: "GET",
        url: api_route + "/get_tasks.php",
        success: (result) => {
            zadaci = JSON.parse(result);
        }
    });
}

function prikaziZadatke(){
    // let tabela_body = document.getElementById('tabela_svih_body');
    let tabela_body = $('#tabela_svih_body');
    let tabela = [];
    zadaci.forEach((zadatak, i) => {
        let zavrsen_chk = '';
        let klasa_zavrsen = '';
        if(zadatak.zavrsen){
            zavrsen_chk = 'checked';
            klasa_zavrsen = 'zavrsen';
        }
        let chk_box = `<input type="checkbox" onchange="zavrsiZadatak(${i})" ${zavrsen_chk} />`;
        let dugme_brisanje = `<button class="btn btn-sm btn-danger " onclick="ukloniZadatak(${i}, ${zadatak.id})" ><i class="fa fa-times"></i></button>`;
        let dugme_izmjena = `<button class="btn btn-sm btn-primary " onclick="izmijeniZadatak(${zadatak.id})" ><i class="fa fa-edit"></i></button>`;
        tabela.push(`<tr id="red_${i}" class="${klasa_zavrsen}" > <td>${zadatak.id}</td><td>${zadatak.tekst}</td><td>${zadatak.opis}</td> <td>${chk_box}</td> <td>${dugme_brisanje}</td><td>${dugme_izmjena}</td> </tr>`);
    });
    tabela_body.html(tabela.join(''));
}

function generisiNoviID(){
    let max = 0;
    for(let i = 0; i < zadaci.length; i++){
        if(zadaci[i].id > max) max = zadaci[i].id;
    }
    return max+1;
}

function zavrsiZadatak(index){
    zadaci[index].zavrsen = !(zadaci[index].zavrsen);
    $.ajax({ 
        type: "POST",
        url: api_route + '/complete_task.php',
        data: { index: index, status: (zadaci[index].zavrsen) },
        success: (response) => {
            $('#red_'+index).toggleClass('zavrsen');
        }
    });
    // prikaziZadatke();
}

function ukloniZadatak(index, taskId){
    $.ajax({
        type: "POST",
        url: api_route + "/delete_task.php",
        data: {id: taskId},
        success:(response) => {
            console.log(response);
            zadaci.splice(index, 1);
            prikaziZadatke();
        }
    });
}

function izmijeniZadatak(zadatakId){
    let zadatak = zadaci.find(zadatak => zadatak.id == zadatakId);
    document.getElementById('izmjena_tekst').value = zadatak.tekst;
    document.getElementById('izmjena_opis').value = zadatak.opis;
    document.getElementById('index_izmjena').value = zadatak.id;
    $("#modal_izmjena").modal('show');
}

function isprazniPolja(tip){
    if(tip == 'izmjena'){
        document.getElementById('izmjena_tekst').value = "";
        document.getElementById('izmjena_opis').value = "";
        document.getElementById('index_izmjena').value = -1;
    }else if(tip == 'dodavanje'){
        document.getElementById('novi_zadatak_tekst').value = "";
        document.getElementById('novi_zadatak_opis').value = ""; 
    }
}

citajZadatke().then( () => {
    prikaziZadatke();
});

// dodavanje event listener-a
document.getElementById('dodaj_novi_forma').addEventListener('submit', function(e){
    e.preventDefault();
    let novi_tekst = document.getElementById('novi_zadatak_tekst').value;
    let novi_opis = document.getElementById('novi_zadatak_opis').value;
    let novi_zadatak = { id: generisiNoviID(), tekst: novi_tekst, opis: novi_opis, zavrsen: false };
    zadaci.push(novi_zadatak);

    $.ajax({
        type: "POST",
        url: api_route + '/add_task.php',
        data: novi_zadatak,
        success: (result) => {
            if(result == "OK"){
                prikaziZadatke();
                $("#modal_dodavanje").modal('hide');
                isprazniPolja('dodavanje');
            }else{
                alert(result);
            }
        }    
    });

});

document.getElementById('izmjena_zadatka_forma').addEventListener('submit', function(e){
    e.preventDefault();

    zadatakId = document.getElementById('index_izmjena').value;
    let zadatak = zadaci.find(zadatak => zadatak.id == zadatakId);
    zadatak.tekst = document.getElementById('izmjena_tekst').value;
    zadatak.opis = document.getElementById('izmjena_opis').value;

    const data = {
        id: zadatak.id,
        tekst: zadatak.tekst,
        opis: zadatak.opis
    };

    $.ajax({
        type: "POST",
        url: api_route + '/edit_task.php',
        data: data,
        success: (result) => {
            prikaziZadatke();
            $("#modal_izmjena").modal('hide');
            isprazniPolja('izmjena');
        }
    });
});