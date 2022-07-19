function novoElemento(tagName, className) {
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}

function Barreira (reversa = false) {
    this.elemento = novoElemento("div", "barreira");

    const borda = novoElemento("div", "borda");
    const corpo = novoElemento("div", "corpo");
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    this.setAltura = altura => corpo.style.height = `${altura}px`;
}

// const b = new Barreira(true);
// b.setAltura(200);
// document.querySelector("[wm-flappy]").appendChild(b.elemento);

function ParDeBarreiras( altura, abertura, x){
    this.elemento = novoElemento("div","par-de-barreiras");

    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;
        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    }

    this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
    this.setX = x => this.elemento.style.left = `${x}px`;
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(x)
}

// const b = new ParDeBarreiras( 700, 200, 400);
// document.querySelector("[wm-flappy]").appendChild(b.elemento);

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura,abertura,largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura,abertura,largura + espaco * 3)
    ]

    const deslocamento = 6;
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento);

            //Quando o elemento sair da  área do jogo.
            if (par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length);
                par.sortearAbertura();
            }

            const meio = largura / 2;
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio;

            if(cruzouOMeio){
                notificarPonto();
            }
            // cruzouOMeio && notificarPonto();
        })
    }
}
function Passaro(alturaJogo) {
    let voando = false;
    this.elemento = novoElemento("img", "passaro");
    this.elemento.src = "imgs/passaro.png";
    
    this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);
    this.setY = y => this.elemento.style.bottom = `${y}px`;
    
    window.onkeydown = e => voando = true;
    window.onkeyup = e => voando = false;
    window.ontouchstart = e => voando = true;
    window.ontouchend = e => voando = false;
    window.onmousedown= e => voando = true;
    window.onmouseup = e => voando = false;
    
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5);
        const alturaMaxima = alturaJogo - this.elemento.clientHeight;
        
        if (novoY <= 0){
            this.setY(0)
        }else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima);
        }else{
            this.setY(novoY);
        }
    }
    
    this.setY(alturaJogo / 2)
}
function Progresso () {
    this.elemento = novoElemento("span", "progresso");
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos;
    }
    this.atualizarPontos(0);
}

function estaoSobrePostos( elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left   
        && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top;
    return horizontal && vertical;
}

function colidiu(passaro, barreiras){
    let colidiu = false;
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) {
            const superior = parDeBarreiras.superior.elemento;
            const inferior = parDeBarreiras.inferior.elemento;
            colidiu = estaoSobrePostos(passaro.elemento, superior)
                || estaoSobrePostos(passaro.elemento, inferior);
        }
    })
    return colidiu;
}
function FlappyBird(){
    let pontos = 0;

    const areaDoJogo = document.querySelector("[wm-flappy]");
    const altura = areaDoJogo.clientHeight; 
    const largura = areaDoJogo.clientWidth;

    const progresso = new Progresso();
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos));
    const passaro = new Passaro(altura); 

    areaDoJogo.appendChild(progresso.elemento);
    areaDoJogo.appendChild(passaro.elemento);
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));

    this.start = () => {
        //loop do jogo;
        const temporizador = setInterval(() => {
            barreiras.animar();
            passaro.animar();

            if(colidiu(passaro, barreiras)){
                console.log("Game over")//Alteração do codigo feita por mim.
                clearInterval(temporizador);
            }
        },20)
    }
}

new FlappyBird().start();

//Codigo escrito por mim.

// const posicaoInicialBarreira = 100;
// let posicoesAtuaisBarreira = [ posicaoInicialBarreira, posicaoInicialBarreira + 10, posicaoInicialBarreira + 20];//Verificar se pode substituir posicoesAtuaisBarreira
// let contador = 0;//Ver se da para substituir contador.
// let pontuacao = 0;
// let acionar = false;
// const passaro = document.querySelector("[wm-passaroMove]");
// let posicaoAtualPassaroY = passaro.getBoundingClientRect().y;
// execucaoPadrao("barreira",[0,0,0],["A","B","C"]);
// function execucaoPadrao(classe, posIniciais,idBarreiras) {
//     iniciaJogo(idBarreiras);
//     setInterval(() => {
//         mecanicaJogo(classe, posIniciais,idBarreiras);
//         if(acionar){
//             subirPassaro( );
//         }else{
//             descerPassaro( );
//         }
//     },0)
// }
// function iniciaJogo(idBarreiras){//Verificar se da para melhorar e atualizar posição de spawn inicial.
//     posicoesAtuaisBarreira = [posicaoInicialBarreira, posicaoInicialBarreira + 10, posicaoInicialBarreira + 20];
//     contador = 0;
//     pontuacao = 0;
//     acionar = false;
//     const score = document.querySelector(`.score`);
//     score.innerHTML = pontuacao;
//     for(let i in idBarreiras){
//         const barreira = document.querySelector(`[wm-barreiraMove=${idBarreiras[i]}]`);//Verificar posteriormente se é bom inserir isto nos parametros desta função.
//         desespawnBarreira(barreira,idBarreiras[i]);
//     }
// }
// function mecanicaJogo(classe,posIniciais = [0],idBarreiras) {
//     for(let i in idBarreiras){
//         const barreira = document.querySelector(`[wm-barreiraMove=${idBarreiras[i]}]`);
//         escondeMostraBarreira(barreira);
//         spawnDesespawnBarreira( classe,posIniciais[i], idBarreiras[i], barreira, i, posicoesAtuaisBarreira[i]);
//         moverBarreira( posIniciais[i], barreira, i, posicoesAtuaisBarreira[i], 0.5);
//         colisaoBloco("A", idBarreiras,barreira);
//         colisaoBloco("B", idBarreiras,barreira);
//         ganhaPonto(barreira,"A");
//     }
// }
// function escondeMostraBarreira(barreira){
//     const telaVisivel = document.querySelector("[wm-flappy]");
//     const infoTelaVisivel = telaVisivel.getBoundingClientRect();
//     const posTelaVisivelX = infoTelaVisivel.x;
//     const comprimentoTelaVisivel = infoTelaVisivel.width;
//     if(barreira != null){
//         const infoBarreira = barreira.getBoundingClientRect();
//         const posBarreiraX = infoBarreira.x;
//         const limiteA = posBarreiraX < posTelaVisivelX + comprimentoTelaVisivel;
//         const limiteB = posBarreiraX > posTelaVisivelX;
//         if(limiteA && limiteB){
//             barreira.style.display = "inline-block";
//         }else{
//             barreira.style.display = "unset";
//         } 
//     }
// }
// function spawnDesespawnBarreira( classe, posInicial, idBarreira, barreira, i, posicaoAtualBarreira) {
//     desespawnBarreiraNoFim(posInicial,barreira,posicaoAtualBarreira);
//     spawnBarreiraNoInicio( classe, posInicial, idBarreira, barreira, i, posicaoAtualBarreira);
// }
// function desespawnBarreiraNoFim( posInicial, barreira, posicaoAtualBarreira){
//     const telaTotal = document.querySelector(".conteudo");
//     const telaNaoVisivel = document.querySelector(".tela");
//     const pontoDeDesespawn = (telaTotal.clientWidth - telaNaoVisivel.clientWidth) / 2;//Verificar se da para melhorar
//     const fimTrajeto =  ( ( (posicaoAtualBarreira - posInicial/100) * 1400) + pontoDeDesespawn);//Verificar se da para melhorar
//     if(fimTrajeto <= posInicial){
//         desespawnBarreira(barreira);
//     }
// }
// function desespawnBarreira(barreira){
//     if(barreira != null){
//         desespawn(barreira);
//         barreira = null;
//     }
// }
// function desespawn(barreira){
//     const regiaoBarreira = document.querySelector(".regiaoBarreira");
//     regiaoBarreira.removeChild(barreira);
// }
// function spawnBarreiraNoInicio( classe, posInicial, idBarreira, barreira, i, posicaoAtualBarreira){
//     if(contador <= 0){
//         spawnBarreira( classe, posInicial, idBarreira, barreira, i, posicaoAtualBarreira);
//     }
// }
// function spawnBarreira( classe, posInicial, idBarreira, barreira, i, posicaoAtualBarreira){
//     if(barreira == null){
//         contador = 100;
//         posicoesAtuaisBarreira[i] = posicaoInicialBarreira + posInicial;
//         spawn( classe, posInicial, idBarreira, posicaoAtualBarreira);
//     }
// }
// function spawn( classe, posInicial = 0, idBarreira, posicaoAtual) {
//     construirBarreira(classe, idBarreira);
//     const barreira = document.querySelector(`[wm-barreiraMove=${idBarreira}]`);
//     barreira.style.left = (posicaoAtual + posInicial) + "%";
// }
// function construirBarreira(classe,idBarreira) {
//     const regiaoBarreira = document.querySelector(".regiaoBarreira");
//     const divBlocoA = criarBloco("A",criarParte("A"),criarParte("B"));//Verificar se da para melhorar escrita.
//     const divBlocoB = criarBloco("B",criarParte("B"),criarParte("A"));
//     const divCanos = criarCanos(divBlocoA,divBlocoB);
//     const divBarreira =  criarBarreira(classe,idBarreira,divCanos);
//     regiaoBarreira.appendChild(divBarreira);
//     definirAlturasBlocos(divBlocoA,divBlocoB);
// }
// function criarParte(idParte){
//     const divParteIdParte = criarDiv();
//     divParteIdParte.classList.add(`parte${idParte}`);
//     return divParteIdParte;
// }
// function criarDiv(){
//     return document.createElement("div");
// }
// function criarBloco(idBloco,divParteA,divParteB){
//     const divBlocoIdBloco = criarDiv();
//     divBlocoIdBloco.classList.add(`bloco${idBloco}`);
//     divBlocoIdBloco.appendChild(divParteA);
//     divBlocoIdBloco.appendChild(divParteB);
//     return divBlocoIdBloco;
// }
// function criarCanos(divBlocoA,divBlocoB){
//     const divCanos = criarDiv();
//     divCanos.classList.add("canos");
//     divCanos.appendChild(divBlocoA);
//     divCanos.appendChild(divBlocoB);
//     return divCanos;
// }
// function criarBarreira(classe,idBarreira,divCanos){
//     const divBarreira = criarDiv();
//     divBarreira.classList.add(classe);
//     divBarreira.setAttribute("wm-barreiraMove", `${idBarreira}`);
//     divBarreira.appendChild(divCanos);
//     return divBarreira;
// }
// function definirAlturasBlocos(blocoA,blocoB) {//Verificar se da para escrever de uma maneira mais legivel
//     const alturaMinimaPossivelDosBlocos = 6;
//     const alturaMaximaPossivelDoBlocoA = 70;
//     const alturaBlocoA = Math.floor(Math.random() * ((alturaMaximaPossivelDoBlocoA + 1) - alturaMinimaPossivelDosBlocos) + alturaMinimaPossivelDosBlocos);
//     const alturaMaximaPossivelDoBlocoB = 76 - alturaBlocoA;
//     const alturaBlocoB =  Math.floor(Math.random() * ((alturaMaximaPossivelDoBlocoB + 1) - alturaMinimaPossivelDosBlocos) + alturaMinimaPossivelDosBlocos);
//     blocoA.style.height = `${alturaBlocoA}%`;
//     blocoB.style.height = `${alturaBlocoB}%`;
// }
// function moverBarreira( posIniciais = 0, barreira, i, posicaoAtualBarreira, passo) {
//     if(barreira != null){
//         posicoesAtuaisBarreira[i] = posicaoAtualBarreira  - passo;
//         barreira.style.left = (posicaoAtualBarreira  + posIniciais) + "%";
//         contador--;
//     }
// }
// function colisaoBloco( idBloco, idBarreiras, barreira) {
//     if(barreira != null){
//         const passaro = document.querySelector("[wm-passaroMove]");
//         const bloco = barreira.querySelector(`.bloco${idBloco}`);
//         const infoPassaro = passaro.getBoundingClientRect();
//         const infoBloco = bloco.getBoundingClientRect();
//         const colidiuX = colisaoHorizontal(infoPassaro,infoBloco,perdeJogo);
//         const colidiuY = colisaoVertical(infoPassaro,infoBloco,perdeJogo);
//         reiniciaJogoNaColisao(colidiuX,colidiuY,idBarreiras);
//     }
// }
// function colisaoHorizontal( infoPassaro, infoBloco, callback, larguraPassaro, larguraBloco){
//     const posPassaroX = infoPassaro.x;
//     const posBlocoX= infoBloco.x;
//     return colisao(callback, posPassaroX, posBlocoX, larguraPassaro || infoPassaro.width, larguraBloco || infoBloco.width);
// }
// function colisaoVertical( infoPassaro, infoBloco, callback, alturaPassaro, alturaBloco){
//     const posPassaroY = infoPassaro.y;
//     const posBlocoY = infoBloco.y;
//     return colisao(callback, posPassaroY, posBlocoY,alturaPassaro || infoPassaro.height, alturaBloco || infoBloco.height);
// }
// function colisao (callback, posPassaroRelativa, posBlocoRelativa, comprimentoPassaro = 0, comprimentoBloco = 0){
//     const limiteA = posPassaroRelativa >= posBlocoRelativa - comprimentoPassaro;
//     const limiteB = posPassaroRelativa <= posBlocoRelativa + comprimentoBloco;
//     if(limiteA  && limiteB){
//         return callback(posPassaroRelativa,posBlocoRelativa,comprimentoPassaro);
//     }
//     return false;
// }
// function perdeJogo(){
//     return true;
// }
// function reiniciaJogoNaColisao( colidiuX, colidiuY, idBarreiras){
//     if(colidiuX && colidiuY){
//         console.log("Game Over");
//         iniciaJogo(idBarreiras);
//     }
// }
// function ganhaPonto(barreira) {
//     if(barreira != null){
//         const passaro = document.querySelector("[wm-passaroMove]");
//         const posPassaro = passaro.getBoundingClientRect();
//         const posBarreira = barreira.getBoundingClientRect();
//         const aumentaPontuacao  = colisaoHorizontal(posPassaro,posBarreira,mudaScore,2,4);//Cuidar ao mudar os valores 2 e 4
//         if(aumentaPontuacao){
//             pontuacao++;
//             const score = document.querySelector(`.score`);
//             score.innerHTML = pontuacao;
//         }
//     }
// }
// const mudaScore = () =>{
//     return true;
// }
// function executarSubirPassaro() {
//     acionar = true;
// }
// function executarDescerPassaro(){
//     acionar = false;
// }
// function subirPassaro() {
//     const passaro = document.querySelector("[wm-passaroMove]");
//     const fim = 6;
//     moverPassaro(passaro, fim, 10,1);
// }
// function descerPassaro() {
//     const passaro = document.querySelector("[wm-passaroMove]");
//     const telaVisivel = document.querySelector("[wm-flappy]");
//     const fim = -(telaVisivel.clientHeight - passaro.clientHeight)+5;
//     moverPassaro(passaro, fim, -5,-1);
// }
// function moverPassaro(passaro, fim, passo,direcao = 1) {//Verificar se da para melhorar posteriormente.
//     if(posicaoAtualPassaroY * direcao > fim){
//         posicaoAtualPassaroY = posicaoAtualPassaroY - passo;
//         passaro.style.top = posicaoAtualPassaroY + "px";
//     }
// }