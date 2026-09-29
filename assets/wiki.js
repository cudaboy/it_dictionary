(() => {
 const input=document.getElementById('wiki-search'), status=document.getElementById('search-status'), sidebar=document.getElementById('term-sidebar'), category=document.getElementById('category-filter'), results=document.getElementById('search-results');
 if(!input)return;
 const normalize=s=>s.normalize('NFKC').toLocaleLowerCase().replace(/[\s·_-]+/g,'');
 const rows=[...sidebar.querySelectorAll('li[data-search]')], cards=[...document.querySelectorAll('.wiki-card[data-search]')];
 let matches=[],active=-1;
 const close=()=>{results.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;};
 const select=i=>{active=i;[...results.children].forEach((li,n)=>li.setAttribute('aria-selected',String(n===i)));if(i>=0){input.setAttribute('aria-activedescendant',results.children[i].id);results.children[i].scrollIntoView({block:'nearest'});}};
 const filter=()=>{
  const q=normalize(input.value);
  [...rows,...cards].forEach(row=>row.hidden=!(normalize(row.dataset.search).includes(q)&&(!category.value||row.dataset.category===category.value)));
  matches=rows.filter(row=>!row.hidden);
  matches.sort((a,b)=>Number(normalize(b.querySelector('a').textContent)===q)-Number(normalize(a.querySelector('a').textContent)===q));
  status.textContent=matches.length?`${matches.length}개 문서 · 제목·약어·별칭·영문명·분류 검색`:'검색 결과가 없습니다. 다른 단어나 전체 분류를 선택해 주세요.';
  results.replaceChildren();active=-1;input.removeAttribute('aria-activedescendant');
  matches.slice(0,8).forEach((row,i)=>{const li=document.createElement('li');li.id=`suggestion-${i}`;li.setAttribute('role','option');li.setAttribute('aria-selected','false');const a=row.querySelector('a').cloneNode(true);a.removeAttribute('aria-current');li.append(a);results.append(li);});
  results.hidden=!q||!matches.length;input.setAttribute('aria-expanded',String(!results.hidden));
 };
 input.addEventListener('input',filter);input.addEventListener('focus',filter);category.addEventListener('change',filter);
 const requested=new URLSearchParams(location.search).get('category');if([...category.options].some(o=>o.value===requested))category.value=requested;
 filter();
 input.addEventListener('keydown',event=>{
  if(event.isComposing)return;
  if(event.key==='Escape'){event.preventDefault();input.value='';filter();close();}
  if((event.key==='ArrowDown'||event.key==='ArrowUp')&&!results.hidden){event.preventDefault();select((active+(event.key==='ArrowDown'?1:-1)+results.children.length)%results.children.length);}
  if(event.key==='Enter'&&input.value&&!results.hidden){event.preventDefault();results.children[Math.max(0,active)]?.querySelector('a')?.click();}
 });
 document.addEventListener('pointerdown',event=>{if(!sidebar.contains(event.target))close();});
 sidebar.addEventListener('focusout',event=>{if(!sidebar.contains(event.relatedTarget))close();});
})();
