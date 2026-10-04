/* MPL-2.0 */
function tokenize(value){return String(value??"").toLocaleLowerCase().normalize("NFKC").match(/[\p{L}\p{N}\p{M}]+/gu)||[];}
export function lexicalScore(query,text){
  const q=tokenize(query), t=tokenize(text); if(!q.length||!t.length)return 0;
  const counts=new Map(t.map(x=>[x,(t.filter(y=>y===x).length)]));
  let score=0; for(const token of q) if(counts.has(token)) score+=1+Math.log1p(counts.get(token));
  return score/q.length;
}
export function reciprocalRankFusion(resultSets,{k=60,weights=[]}={}){
  const map=new Map();
  resultSets.forEach((set,i)=>set.forEach((item,rank)=>{
    const id=item.id; if(!id)return;
    const w=weights[i]??1; const row=map.get(id)||{...item,score:0,sources:[]};
    row.score+=w/(k+rank+1); row.sources.push(i); map.set(id,row);
  }));
  return [...map.values()].sort((a,b)=>b.score-a.score);
}
export function hybridRank(query,documents,{semanticScores=new Map(),lexicalWeight=.65,semanticWeight=.35}={}){
  return documents.map(doc=>{
    const lexical=lexicalScore(query,doc.text); const semantic=Number(semanticScores.get(doc.id)||0);
    return {...doc,lexicalScore:lexical,semanticScore:semantic,score:lexical*lexicalWeight+semantic*semanticWeight};
  }).sort((a,b)=>b.score-a.score);
}
