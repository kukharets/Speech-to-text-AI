function reddenPage() {
    console.log('hello')
}


let isAltPressedForElement = null;

function translate(text = '') {
    const cyrillicPattern = /^[\u0400-\u04FF]+$/;
    const correction = text.split(' ').find(el => !!el);
    console.log(correction)
    const isCyrillic = correction && cyrillicPattern.test(correction[0]);
    const targetLang = isCyrillic ? 'EN-US' : 'UK'
    console.log('trans', text, isCyrillic)
    return fetch("http://127.0.0.1:5000/login?text=" + text + '&lang=' + targetLang, {method: 'GET',headers: {
            'DeepL-Auth-Key': process.env.DEEPL_KEY,
        },})
        .then((response) => response.json())
        .then((json) => json.success);
}

const func = async (e) => {
    e.stopPropagation();
    const { code, target } = e;
    console.log(code)
    if (code !== 'KeyS'){
        return
    }
    const selObj = window.getSelection();
    const selectedText = selObj.toString();
    const resText = await translate(selectedText || target.value)


    if (target.type !== 'text' && selectedText.length) {
        console.log('text', resText)
        const node = selObj.className ? selObj : selObj.anchorNode.parentNode;
        node.innerHTML = node.innerHTML.replace(selectedText, resText)
    }


    // Replace text in input
    if (target.value && target.type === 'text') {
        target.value = resText
    }
};

document.addEventListener('keydown', ({code, target})=>{
    if (code === 'AltLeft' && !isAltPressedForElement) {
        isAltPressedForElement = target;
        document.addEventListener('keydown', func)
    }
});

document.addEventListener('keyup', ({code, target})=>{
    if (code === 'AltLeft') {
        isAltPressedForElement = null;
        document.removeEventListener('keydown', func)
    }
});
