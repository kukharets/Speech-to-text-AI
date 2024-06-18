// fetch("https://api-free.deepl.com/v2/translate", {method: 'POST',headers: {
//         'DeepL-Auth-Key': 'fbc4dedc-09ee-4207-97f9-21c25806943e:fx',
//     },body: {"text":["Hello, world!"],"target_lang":"DE","source_lang":"EN","glossary_id":"[yourGlossaryId]"},})
//     .then((response) => response.json())
//     .then((json) => console.log(json));

function start(value) {
    const valye = document.querySelector('#fname').value
    fetch("http://127.0.0.1:5000/login?text=" + valye, {method: 'GET',headers: {
            'DeepL-Auth-Key': 'fbc4dedc-09ee-4207-97f9-21c25806943e:fx',
        },})
        .then((response) => response.json())
        .then((json) => {
            console.log(json)
        });
}
