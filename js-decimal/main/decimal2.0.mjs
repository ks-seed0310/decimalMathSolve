class decimalsup{
    static sum(init,...args){
        return args.reduce((prev,curr)=>prev+curr,init)
    }
    /**@param {string} s @param {number} d10$x @returns {string} */
    static shiftRight(s,d10$x){
        if (d10$x===0)return s;
        if (d10$x<0)return this.shiftLeft(s,-d10$x)
        if ((s.split("-").length-1)&1===1)return "-"+this.shiftRight(s.replace(/\-+/,""),d10$x)
        else s=s.replace(/\-/g,"")
        let [int="0",float=""]=s.split(".");
        let all=int+float;
        let ndotps=int.length+d10$x;
        let res;
        if (ndotps>=all.length){
            res=all.padEnd(ndotps,"0")
        }else{
            res=all.slice(0,ndotps)+"."+all.slice(ndotps)
        }
        return res.replace(/^(0+)(.+$)/g,"$2").replace(/^\./,"0.").replace(/\.0+$/, "").replace(/(\.\d*?[1-9])0+$/, "$1")
    }
    /**@param {string} s @param {bigint} d10$x @returns {string} */
    static shiftLeft(s,d10$x){
        if (d10$x===0)return s;
        if (d10$x<0)return this.shiftRight(s,-d10$x)
        if ((s.split("-").length-1)&1===1)return "-"+this.shiftLeft(s.replace(/\-+/,""),d10$x)
        else s=s.replace(/\-/g,"")
        let [int="0",float=""]=s.split(".");
        let all=int+float;
        let ndotps=int.length-d10$x;
        let res;
        let result;
        let ndotps2;
        if (ndotps<=0){
            res=all.padStart(int.length+d10$x,"0")
            ndotps2=res.length-d10$x
        }else{
            ndotps2=ndotps
            res=all
        }
        result=res.slice(0,ndotps2)+"."+res.slice(ndotps2)
        return result.replace(/^(0+)(.+$)/g,"$2").replace(/^\./,"0.").replace(/\.0+$/, "").replace(/(\.\d*?[1-9])0+$/, "$1")
    }
    /**@param {Array<any>} args @returns {Array<_decimal_pack>} */
    static toalldp(...args){
        for (let i=0;i<args.length;i++){
            if (!(args[i] instanceof _decimal_pack)||!(args[i].constructor===_decimal_pack)){
                if (Array.isArray(args[i])){
                    args[i]=new _decimal_pack(...args[i])
                }else{
                    args[i]=new _decimal_pack(args[i])
                }
            }
        }
        return args
    }
}
class _decimal_pack{
    #ts={inf:["infinity",this.type_inf]}
    /**@param {string|number|bigint} value*/
    constructor(value,constShift=null){
        const v=String(value)
        this.exp=(Number.isNaN(Number(constShift))||!constShift)?(v.includes(".")?v.length-v.indexOf(".")-1:0):Number(constShift)
        this.vint=BigInt(decimalsup.shiftRight(v,this.exp))
        this.raw=v
    }
    get d10$x_exp(){
        return -(this.exp-(this.vint.toString().length-1))
    }
    get d10$x_d(){
        const dexp=this.d10$x_exp
        if (dexp<0){
            return decimalsup.shiftLeft(String(this.raw),dexp)
        }else{
            return decimalsup.shiftRight(String(this.raw),-dexp)
        }
    }
    [Symbol.toStringTag]="Decimal"
    getall(){return {exp:exp,vint:this.vint,d10$x_exp:this.d10$x_exp}}
    type_inf(){}
}
class decimal{
    #oReturnpackage={fn:String,isnew:false}
    #mulConfig={karatubaExecute:true,karatubaThresholdBits:1024}
    #divConfig={prec:72}
    #logConfig={prec:/*24*/32}
    #powConfig={prec:32}
    #globalConfig={plusMathLength:8}
    #respack(v){return this.#oReturnpackage.isnew?new(this.#oReturnpackage.fn(v)):this.#oReturnpackage.fn(v)}
    add(...values){
        const vls=values.map(x=>String(x))
        const vmx=Math.max(...vls.map(v=>v.includes(".")?v.length-v.indexOf(".")-1:0))
        const val=decimalsup.toalldp(...values.map(x=>[x,vmx]))
        const rsm=decimalsup.sum(0n,...val.map(x=>x.vint))
        const rpm=decimalsup.shiftLeft(String(rsm),vmx)
        return this.#respack(rpm)
    }
    sub(...values){
        const val=values.map((v,i)=>i===0?String(v):(typeof v==="number"||typeof v==="bigint"?String(-v):(typeof v==="string"?"-"+v:null)))
        if (val.includes(null))throw new TypeError("Only Number, BigInt, and String arguments are accepted.")
        return this.add(...val)
    }
    mul(...values){return this.#respack(this.#mul_sub(...values))}
    #mul_sub(...values){
        let args=[]
        let sdp=0
        for (let i=0;i<values.length;i++){
            if (values[i].constructor!==_decimal_pack||!values[i] instanceof _decimal_pack){
                args.push(new _decimal_pack(values[i]))
            }else{
                args.push(values[i])
            }
            sdp+=args[args.length-1].exp
        }
        return decimalsup.shiftLeft(String(this.#int_mul(...args)),sdp)
    }
    /**@param {..._decimal_pack|bigint} values @returns {bigint} */
    #int_mul(...values){
        /**@type {Array<bigint>} */
        const val=values.map(x=>x.vint??x)
        if (val.length===0)return 0n
        if (val.length===1)return this.#int_mul(values[0],1n)
        if (val.length>2)return values.reduce((prev,curr)=>this.#int_mul(prev,curr),1n)
        const n=val[0]
        const m=val[1]
        const nl=n.toString(2).length
        const ml=m.toString(2).length
        if (!this.#mulConfig.karatubaExecute||(nl<this.#mulConfig.karatubaThresholdBits&&ml<this.#mulConfig.karatubaThresholdBits)){
            return n*m
        }
        const shift=BigInt(Math.floor(Math.max(nl,ml)/2))
        const A=n>>shift
        const B=n%(1n<<shift)
        const C=m>>shift
        const D=m%(1n<<shift)
        const z2=this.#int_mul(A,C)
        const z0=this.#int_mul(B,D)
        const z1=this.#int_mul(A+B,C+D)
        return (z2<<(2n*shift))+((z1-z2-z0)<<shift)+z0
    }
    div(...values){return this.#respack(this.#div_sub(...values))}
     /**@param {..._decimal_pack|bigint} values */
    #div_sub(...values){
        const valmin=decimalsup.toalldp(...values).map(x=>[x.vint,x.exp])
        /**@type {Array<bigint>} */
        const val=[]
        /**@type {Array<number>} */
        const vmi=[]
        for (const [_vl,_vm] of valmin){
            val.push(_vl)
            vmi.push(_vm)
        }
        if (val.length===0)return NaN
        if (val.length===1)val.push(1n)
        const mbs=this.#mul_sub(...values.slice(1))
        const mdc=new _decimal_pack(mbs).exp
        const ndc=vmi[0]
        const dpt=Math.max(mdc,ndc)
        const mbi=BigInt(decimalsup.shiftRight(mbs,mdc))
        const nbi=BigInt(val[0])
        const res=nbi*(10n**BigInt(dpt+this.#divConfig.prec+this.#globalConfig.plusMathLength))/mbi
        return decimalsup.shiftLeft(String(res),dpt+this.#divConfig.prec+this.#globalConfig.plusMathLength+ndc-mdc)
    }
    mod(...values){
        //mod(1,2,3)-->(1%2)%3
        if (values.length===0)return NaN
        if (values.length===1)return values[0]
        if (values.length>2)return values.slice(1).reduce((prev,curr)=>this.mod(prev,curr),values[0])
        const n=values[0]
        const m=values[1]
        const dvi=Math.floor(Number(this.#div_sub(n,m)))
        return this.sub(n,this.mul(dvi,m))
    }
    pow(x,y){
        if (Number.isInteger(y)){
            if (Number.isInteger(x)){return this.#respack(this.#int_pow(x,y))}
            else{return this.#respack(this.#float_pow(x,y))}
        }else{return this.#respack(this.#yFrac_pow(x,y))}
    }
    #int_pow(x,y){
        const X=new _decimal_pack(x).vint
        let Y=new _decimal_pack(y).vint
        const isMinus=Y<0n?true:false
        if(isMinus)Y=-Y
        let slr=X**Y
        if (isMinus){
            slr=this.div("1",slr)
        }
        return slr
    }
    #float_pow(x,y){
        const X=new _decimal_pack(x)
        const Y=new _decimal_pack(y)
        const isMinus=Y<0n?true:false
        const lst=BigInt(X.exp*y)
        let vpr=this.#div_sub(X.vint**Y.vint,10n**lst)
        if (isMinus){
            vpr=this.#div_sub("1",vpr)
        }
        return vpr
    }
    #yFrac_pow(x,y){//dev
        const expr=this.#concat_val(this.#mul_sub(y,this.log(x)),this.#powConfig.prec)
        const epow=this.exp(expr)
        return epow
    }
    artanh(x,limit_dotlen=this.#logConfig.prec+this.#globalConfig.plusMathLength){
        let now=0
        let n=1
        const x2=this.pow(x,2)
        let xPow=x
        while (true){
            let ads=this.#div_sub(xPow,2*n-1)
            now=this.add(now,ads)
            if (Math.abs(Number(decimalsup.shiftRight(ads,limit_dotlen)))<1)break
            xPow=this.#mul_sub(xPow,x2)
            n++
        }
        return now
    }
    #concat_val(val,limit=val.length){
        const [int="0",float=""]=val.split(".")
        const lps=Math.min(float.length,limit)
        return [int,float.slice(0,lps)].join(".")
    }
    get E   (){return "2.7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274274663919320030599218174135966290435729003342952605956307381323286279434907632338298807531952510190115738341879307021540891499348841675092447614606680822648001684774118537423454424371075390777449920695517027618386062613313845830007520449338265602976067371132019220504046269954760598103857083582685724245415069595082953311686172785588907509838175463746493931925506040092770167113900984882401285836160356370766010471018194295559619894676783744944825537977472684710404753464620804668425906949129331367702898915210475216205696602405803815019351125338243003558764024749647326391419927260426992279678235478163600934172164121992458631503028618297455570674983850549458858692699569092721079750930295532116534498720275596023648066549911988183479775356636980742654252786255181841757467289097777279380008164706001614524919217321721477235014144197356854816136115735255213347574184946843852332390739414333454776241686251898356948556209921922218427255025425688767179049460165346680498862723279178608578438382796797668145410095388378636095068006422512520511739298489608412848862694560424196528502221066118630674427877549094699318899412322932832699257481359810022865911210249013509"}
    get LN10(){return "2.30258509299404568401799145468436420760110148862877297603332790096757260967735248023599720508959829834196778404228624863340952546508280675666628736909878168948290720832555468084379989482623319852839350530896537773262884616336622228769821988674654366747440424327436515504893431493939147961940440022210510171417480036880840126470806855677432162283552201148046637156591213734507478569476834636167921018064450706480002775026849167465505868569356734206705811364292245544057589257242082413146956890167589402567763113569192920333765871416602301057030896345720754403708474699401682692828084811842893148485249486448719278096762712757753970276686059524967166741834857044225071979650047149510504922147765676369386629769795221107182645497347726624257094293225827985025855097852653832076067263171643095059950878075237103331011978575473315414218084275438635917781170543098274823850456480190956102992918243182375253577097505395651876975103749708886921802051893395072385392051446341972652872869651108625714921988499787489"}
    get LN2 (){return "0.693147180559945309417232121458176568075500134360255254120680009493393621969694715605863326996418687542001481020570685733685520235758130557035266554067171715774078532004335598201783795432304674930331932336293442707027271457174845504151921144216817445452203085287691561893003010519041002030753959193902432845523995133259916465452424750651012565138133525175169829102400705475326438125883484435641730522714584483753590596881265836523930636376674449984337237365313303305951129330414131785869159740440856185632006214526527921339864192728780611644715445963287040529813011944679815076041530134705228253258952404981144802976003310322764475431031351177655815325140528590390947562688653248357453367003463137361100643632142104642382777303022533026548721055613689327230692147064120624327210947718157563140230548599979991248410592572427161102981366332593977245618494250227106352251276949257039826111928531429715508301505139069150593024565115351636203204471017713838388474251869123348946231508191063074023345172675214256656361212389148797341952433434742331295984224355228846385350230785044774899385591500304206047147766914711422513981144851270123516345"}
    /**@type {Array<string>} */
    #log_S=[]
    #ln_Si=[]
    logS_set(){
        const res=[]
        const rsl=[]
        for (let i=0;i<64;i++){
            const I=this.sub(1,this.pow(2,-(i+1)))
            res.push(I)
            rsl.push(this.#ln_o(I))
        }
        this.#log_S=res
        this.#ln_Si=rsl
    }
    #ln_o(z){
        let num=this.sub(z,1)
        let den=this.add(z,1)
        let x=this.#div_sub(num,den)
        let a=this.artanh(x)
        return this.mul(2,a)
    }
    #log_ts(n){
        if(1<=n&&n<1.25)return 1
        if(1.25<=n&&n<1.5)return 0.8
        if(1.5<=n&&n<1.75)return 0.67
        if(1.75<=n&&n<=2)return 0.58
        if(2<=n&&n<2.25)return 0.5
        if(2.25<=n&&n<2.5)return 0.45
        if(2.5<=n&&n<2.75)return 0.4
        if(2.75<=n&&n<3)return 0.37
        if(3<=n&&n<3.25)return 0.34
        if(3.25<=n&&n<3.5)return 0.31
        if(3.5<=n&&n<3.75)return 0.28
        if(3.75<=n&&n<4)return 0.27
        if(4<=n&&n<4.25)return 0.25
        if(4.25<=n&&n<4.5)return 0.24
        if(4.5<=n&&n<4.75)return 0.23
        if(4.75<=n&&n<5)return 0.22
        if(5<=n&&n<5.25)return 0.2
        if(5.25<=n&&n<5.75)return 0.19
        if(5.75<=n&&n<6)return 0.18
        if(6<=n&&n<6.25)return 0.17
        if(6.25<=n&&n<6.75)return 0.16
        if(6.75<=n&&n<7.25)return 0.15
        if(7.25<=n&&n<7.75)return 0.14
        if(7.75<=n&&n<8.5)return 0.13
        if(8.5<=n&&n<9.25)return 0.12
        if(9.25<=n&&n<10)return 0.11
        if(10<n)return 0.1
        return 1
    }
    log(n){
        if (this.#log_S.length===0)this.logS_set()
        const nb=new _decimal_pack(n)
        const k=this.#log_ts(Number(nb.d10$x_d))
        let zk=this.#mul_sub(nb.d10$x_d,k)
        let zsk=this.#ln_o(k)
        for (let i=0;i<64;i++){
            const test=this.#mul_sub(zk,this.#log_S[i])
            if (test>=1){
                zk=test
                zsk=this.add(zsk,this.#ln_Si[i])
            }
        }
        const o=this.artanh(this.div(this.sub(zk,1),this.add(zk,1)))
        return this.add(
            this.sub(this.mul(2,o),zsk),
            this.mul(nb.d10$x_exp,this.LN10)
        )
    }
    log10(n){
        return this.div(this.log(n),this.LN10)
    }
    log2(n){
        return this.div(this.log(n),this.LN2)
    }
    numToNln2r(x){return {n:Math.floor(this.#div_sub(x,this.LN2)),r:this.mod(x,this.LN2)}}
    numToNln10r(x){return {n:Math.floor(this.#div_sub(x,this.LN10)),r:this.mod(x,this.LN10)}}
    numTo2Nr(x){return {n:Math.floor(this.#div_sub(x,2)),r:this.mod(x,2)}}
    numTo10Nr(x){return {n:Math.floor(this.#div_sub(x,10)),r:this.mod(x,10)}}
    exp(x,limit_dotlen=this.#logConfig.prec+this.#globalConfig.plusMathLength){
        const xdp=new _decimal_pack(x)
        const ldp=new _decimal_pack(this.LN2.slice(0,limit_dotlen+8))
        console.log(xdp,ldp)
        //const N=(this.#div_sub(xdp,ldp))
        const R=this.mod(x,ldp)
        const N=this.div(this.sub(x,R),ldp)
        console.log(N,R)
        let now="1"
        let n=1n
        let frac_now=1n
        //const x2=this.pow(R,2)
        let rPow=R
        while (true){
            let ads=(this.div(rPow,frac_now))
            now=this.add(now,ads)
            if (Math.abs(Number(decimalsup.shiftRight(ads,limit_dotlen)))<1)break
            rPow=this.#mul_sub(rPow,R)
            n++
            frac_now*=n
        }
        const pw=this.#int_pow(2,N)
        console.log(N,pw,this.#int_pow("2",N))
        return this.mul(pw,now)
    }
}
globalThis.decimalsup=decimalsup
globalThis.decimal_pack=_decimal_pack
globalThis.decimal=decimal
