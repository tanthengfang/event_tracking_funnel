import { Fragment, useState, useMemo, useEffect, useContext, createContext, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
 
const C = {
  bg:"#f5f5f5",card:"#fff",border:"#e5e7eb",border2:"#d1d5db",
  text:"#111827",text2:"#1f2937",text3:"#6b7280",muted:"#9ca3af",
  accent:"#2563eb",accentBg:"#eff6ff",accentLight:"#dbeafe",
  success:"#16a34a",successBg:"#f0fdf4",
  danger:"#dc2626",dangerBg:"#fef2f2",
  warn:"#d97706",warnBg:"#fffbeb",
  seg:["#2563eb","#64748b","#374151","#6b7280","#93c5fd","#cbd5e1"],
};
const STEP_COLORS=["#2563eb","#475569","#374151","#1d4ed8","#64748b","#1e3a5f","#334155","#0f172a","#1e40af","#4b5563"];
const PRESET_COLORS=["#2563eb","#475569","#0f766e","#b45309","#7c3aed","#be185d","#0369a1"];
const STORAGE_KEY="vpn-analytics-v5";
const LangCtx = createContext("en");
const useLang = () => useContext(LangCtx);
const DateRangeCtx = createContext(null);
const useDateRange = () => useContext(DateRangeCtx);
 
const DATE_PRESETS = [
  {label:"Last 7 days",days:7},
  {label:"Last 14 days",days:14},
  {label:"Last 30 days",days:30},
  {label:"Last 60 days",days:60},
  {label:"Last 90 days",days:90},
  {label:"Last 6 months",days:180},
  {label:"Last 12 months",days:365},
];
 
function toInputDate(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fromInputDate(s){
  const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);
}
function fmtDisplay(d){
  return `${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
}
function daysBetween(a,b){
  return Math.max(1,Math.round((b-a)/(1000*60*60*24))+1);
}
 
function DateRangePicker(){
  const [open,setOpen]=useState(false);
  const {startDate,endDate,label,setRange}=useContext(DateRangeCtx);
  const [customStart,setCustomStart]=useState(toInputDate(startDate));
  const [customEnd,setCustomEnd]=useState(toInputDate(endDate));
  const [tab,setTab]=useState("presets");
  const ref=useRef();
 
  useEffect(()=>{
    if(!open)return;
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);
 
  useEffect(()=>{
    setCustomStart(toInputDate(startDate));
    setCustomEnd(toInputDate(endDate));
  },[startDate,endDate]);
 
  const applyCustom=()=>{
    const s=fromInputDate(customStart);
    const e=fromInputDate(customEnd);
    if(s>e)return;
    setRange({startDate:s,endDate:e,label:"Custom range"});
    setOpen(false);
  };
 
  const today=new Date();
  return(
    <div ref={ref} style={{position:"relative",userSelect:"none"}}>
      <button onClick={()=>setOpen(v=>!v)}
        style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:5,border:`1px solid ${open?C.accent:C.border}`,background:open?C.accentBg:C.card,cursor:"pointer",fontSize:11,color:open?C.accent:C.text3,boxShadow:open?`0 0 0 2px ${C.accentLight}`:"none",transition:"all 0.15s"}}>
        <span style={{fontSize:12}}>📅</span>
        <span style={{fontWeight:600,color:open?C.accent:C.text}}>{label}</span>
        <span style={{fontSize:10,color:C.muted}}>{fmtDisplay(startDate)} – {fmtDisplay(endDate)}</span>
        <span style={{fontSize:9,color:open?C.accent:C.muted,marginLeft:2,display:"inline-block",transform:open?"rotate(180deg)":"none",transition:"transform 0.15s"}}>▼</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:600,background:C.card,border:`1px solid ${C.border2}`,borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.13)",minWidth:260}}>
          <div style={{display:"flex",borderBottom:`1px solid ${C.border}`}}>
            {["presets","custom"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{flex:1,padding:"8px",fontSize:11,fontWeight:tab===t?600:400,color:tab===t?C.accent:C.muted,background:tab===t?C.accentBg:"transparent",border:"none",cursor:"pointer",borderBottom:`2px solid ${tab===t?C.accent:"transparent"}`,transition:"all 0.15s"}}>
                {t==="presets"?"Quick Select":"Custom Range"}
              </button>
            ))}
          </div>
 
          {tab==="presets"&&(
            <div>
              {DATE_PRESETS.map(p=>{
                const s=new Date(today);s.setDate(s.getDate()-p.days+1);
                const sel=label===p.label;
                return(
                  <div key={p.days} onClick={()=>{setRange({startDate:s,endDate:today,label:p.label,days:p.days});setOpen(false);}}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 13px",cursor:"pointer",background:sel?C.accentBg:C.card,borderLeft:`3px solid ${sel?C.accent:"transparent"}`}}
                    onMouseEnter={e=>{if(!sel)e.currentTarget.style.background="#f9fafb";}}
                    onMouseLeave={e=>{if(!sel)e.currentTarget.style.background=C.card;}}>
                    <span style={{fontSize:12,fontWeight:sel?600:400,color:sel?C.accent:C.text}}>{p.label}</span>
                    <span style={{fontSize:10,color:C.muted}}>{fmtDisplay(s)} – {fmtDisplay(today)}</span>
                  </div>
                );
              })}
            </div>
          )}
 
          {tab==="custom"&&(
            <div style={{padding:"14px 14px 12px"}}>
              <div style={{display:"flex",gap:10,marginBottom:12}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>Start date</div>
                  <input type="date" value={customStart} max={customEnd} onChange={e=>setCustomStart(e.target.value)}
                    style={{width:"100%",padding:"7px 9px",borderRadius:6,border:`1.5px solid ${C.border2}`,fontSize:12,color:C.text,outline:"none",boxSizing:"border-box",background:C.card}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>End date</div>
                  <input type="date" value={customEnd} min={customStart} max={toInputDate(today)} onChange={e=>setCustomEnd(e.target.value)}
                    style={{width:"100%",padding:"7px 9px",borderRadius:6,border:`1.5px solid ${C.border2}`,fontSize:12,color:C.text,outline:"none",boxSizing:"border-box",background:C.card}}/>
                </div>
              </div>
              {customStart&&customEnd&&fromInputDate(customStart)<=fromInputDate(customEnd)&&(
                <div style={{fontSize:11,color:C.muted,marginBottom:10,textAlign:"center"}}>
                  {daysBetween(fromInputDate(customStart),fromInputDate(customEnd))} days selected
                </div>
              )}
              {customStart&&customEnd&&fromInputDate(customStart)>fromInputDate(customEnd)&&(
                <div style={{fontSize:11,color:C.danger,marginBottom:10,textAlign:"center"}}>Start date must be before end date</div>
              )}
              <button onClick={applyCustom}
                disabled={!customStart||!customEnd||fromInputDate(customStart)>fromInputDate(customEnd)}
                style={{width:"100%",padding:"7px",borderRadius:6,border:"none",background:C.accent,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",opacity:(!customStart||!customEnd||fromInputDate(customStart)>fromInputDate(customEnd))?0.4:1}}>
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 
const useT = () => {
  const l = useContext(LangCtx);
  return {
    appTitle:l==="zh"?"VPN 数据分析":"VPN Analytics",
    appSubtitle:l==="zh"?"漏斗 · 相关性 · 事件":"Funnel · Correlation · Events",
    lastDays:l==="zh"?"过去 30 天":"Last 30 days",
    tabFunnel:l==="zh"?"漏斗构建器":"Funnel Builder",
    tabCorr:l==="zh"?"事件相关性":"Event Correlation",
    tabEvents:l==="zh"?"事件定义":"Event Definitions",
    filters:l==="zh"?"配置面板":"Configure Panel",
    aggregateBy:l==="zh"?"聚合方式":"Aggregate By",
    aggUsers:l==="zh"?"唯一用户":"Unique Users",
    aggSessions:l==="zh"?"唯一会话":"Unique Sessions",
    stepOrder:l==="zh"?"步骤顺序":"Step Order",
    orderSequential:l==="zh"?"顺序匹配":"Sequential",
    orderStrict:l==="zh"?"严格顺序":"Strict Order",
    orderAny:l==="zh"?"任意顺序":"Any Order",
    convCalc:l==="zh"?"转化率计算":"Conversion Rate",
    convOverall:l==="zh"?"总体转化率":"Overall Conversion",
    convRelative:l==="zh"?"相对上一步":"Relative to Prev Step",
    breakDownBy:l==="zh"?"细分维度":"Break Down By",
    noBreakdown:l==="zh"?"不细分":"No breakdown",
    byDevice:l==="zh"?"按设备":"By Device",
    byStatus:l==="zh"?"BASE/免费/VIP/SVIP":"BASE/Free/VIP/SVIP",
    byRegion:l==="zh"?"按地区":"By Region",
    presetFunnels:l==="zh"?"预设漏斗":"Preset Funnels",
    loading:l==="zh"?"加载中…":"Loading…",
    saveCurrentAsPreset:l==="zh"?"+ 保存为预设":"+ Save as Preset",
    addSteps:l==="zh"?"添加步骤":"Add Steps",
    funnelSteps:l==="zh"?"漏斗步骤":"Funnel Steps",
    savePreset:l==="zh"?"保存预设":"Save Preset",
    runFunnel:l==="zh"?"运行漏斗":"Run Funnel",
    selectPresetOrAdd:l==="zh"?"请选择预设或添加步骤":"Select a preset or add steps",
    funnelChart:l==="zh"?"漏斗图表":"Funnel Chart",
    stepByStep:l==="zh"?"逐步分析":"Step-by-Step Breakdown",
    breakdown:l==="zh"?"分组":"Breakdown",
    totalConv:l==="zh"?"总转化率":"Total Conv.",
    saveAsCustom:l==="zh"?"保存为自定义预设":"Save as Custom Preset",
    presetName:l==="zh"?"预设名称":"Preset Name",
    presetNamePh:l==="zh"?"例如：我的支付流程":"e.g. My Payment Flow",
    stepsPreview:l==="zh"?"步骤预览":"Steps preview",
    cancel:l==="zh"?"取消":"Cancel",
    saving:l==="zh"?"保存中…":"Saving…",
    pleaseName:l==="zh"?"请输入名称":"Please enter a name.",
    failedSave:l==="zh"?"保存失败":"Failed to save.",
    deletePresetTitle:l==="zh"?"删除预设？":"Delete preset?",
    deleteBtn:l==="zh"?"删除":"Delete",
    searchSteps:l==="zh"?"搜索步骤…":"Search steps…",
    breakdownLabel:{device:l==="zh"?"设备":"Device",status:l==="zh"?"状态":"Status",region:l==="zh"?"地区":"Region"},
    stepsCount:(n)=>l==="zh"?`${n} 个步骤 · 拖动排序`:`${n} steps · drag to reorder`,
    stepsCollapsed:(n)=>l==="zh"?`${n} 个步骤（已折叠）`:`${n} steps (collapsed)`,
    deleteConfirmText:(n)=>l==="zh"?`"${n}" 将被永久删除`:`"${n}" will be permanently removed.`,
    outPurchase:l==="zh"?"已购买":"Purchased",
    outD7:l==="zh"?"7日留存":"D7 Retention",
    outD30:l==="zh"?"30日留存":"D30 Retention",
    outReferral:l==="zh"?"已推荐":"Referred",
    outUpgrade:l==="zh"?"等级升级":"Tier Upgrade",
    fmtTime:(h)=>{if(h===null||h===undefined)return"—";if(h<1)return`${Math.round(h*60)}${l==="zh"?"分钟":"m"}`;if(h<24)return`${h.toFixed(1)}${l==="zh"?"小时":"h"}`;if(h<720)return`${(h/24).toFixed(1)}${l==="zh"?"天":"d"}`;return`${(h/720).toFixed(1)}${l==="zh"?"个月":"mo"}`;},
    clearAll:l==="zh"?"清除全部":"Clear All",
    loadFunnel:l==="zh"?"加载漏斗":"Load Funnel",
    loaded:l==="zh"?"✓ 已加载":"✓ Loaded",
    refreshing:l==="zh"?"刷新中…":"Refreshing…",
    refresh:l==="zh"?"刷新":"Refresh",
    noResults:l==="zh"?"无结果":"No results",
    clearFilters:l==="zh"?"清除全部":"Clear all",
    goalOutcomeLabel:l==="zh"?"目标结果":"Goal Outcome",
    eventCategoriesLabel:l==="zh"?"事件类别":"Event Categories",
    correlationLabel:l==="zh"?"相关性":"Correlation",
    sortByLabel:l==="zh"?"排序方式":"Sort By",
    corrEventsHeader:l==="zh"?"相关事件":"Correlated Events",
    completedHeader:l==="zh"?"已转化":"Completed",
    droppedOffHeader:l==="zh"?"已流失":"Dropped Off",
    keyFindingsHeader:l==="zh"?"关键发现":"Key Findings",
    moreLikely:(x)=>l==="zh"?`执行该事件的用户完成漏斗的可能性高 ${x} 倍`:`Users who performed this event were ${x}x more likely to complete the funnel`,
    successLabel:l==="zh"?"成功":"Success",
    dropoffLabel:l==="zh"?"流失":"Drop-off",
    liftLabel:l==="zh"?"提升倍数":"Lift",
    opportunityLabel:l==="zh"?"机会分":"Opportunity",
    usersLabel:l==="zh"?"用户数":"Users",
    noEventsMatch:l==="zh"?"暂无符合筛选条件的事件":"No events match current filters.",
    paginationText:(a,b,total)=>l==="zh"?`${a}–${b} / 共 ${total} 条`:`${a}–${b} of ${total}`,
    findingHigh:l==="zh"?"与目标转化显著相关。":"Strongly linked to increased conversion.",
    findingMed:l==="zh"?"对目标转化有正向信号。":"Positive signal for goal completion.",
    findingLow:l==="zh"?"信号较弱。":"Weak signal.",
    findingRare:l==="zh"?"极少出现。":"Very rarely performed.",
    findingMinority:l==="zh"?"少数用户有此行为。":"Done by a minority of users.",
    findingWide:l==="zh"?"广泛存在。":"Widely performed.",
    segments:l==="zh"?"筛选器":"Filter",
    addDesc:l==="zh"?"添加描述…":"Add a description for this event",
  };
};
 
const ALL_EVENTS = [
  {id:"account_created",label:"Account Created",labelZh:"账户已创建",tag:"Registration",type:"custom"},
  {id:"referral_code_entered",label:"Referral Code Entered",labelZh:"输入推荐码",tag:"Registration",type:"custom"},
  {id:"onboarding_started",label:"Onboarding Started",labelZh:"引导流程开始",tag:"Registration",type:"custom"},
  {id:"first_page_viewed",label:"First Page Viewed",labelZh:"首次查看页面",tag:"Registration",type:"pageview"},
  {id:"email_binded",label:"Email Account Binded",labelZh:"绑定邮箱账户",tag:"Registration",type:"custom"},
  {id:"server_list_viewed",label:"Server List Viewed",labelZh:"查看服务器列表",tag:"Nodes",type:"pageview"},
  {id:"node_selected",label:"Node Selected",labelZh:"选择节点",tag:"Nodes",type:"custom"},
  {id:"node_connected",label:"Node Connected Successfully",labelZh:"节点连接成功",tag:"Nodes",type:"custom"},
  {id:"node_connection_failed",label:"Node Connection Failed",labelZh:"节点连接失败",tag:"Nodes",type:"custom"},
  {id:"vpn_session_1min",label:"Session > 1 min",labelZh:"会话 > 1 分钟",tag:"Nodes",type:"custom"},
  {id:"vpn_session_10min",label:"Session > 10 min",labelZh:"会话 > 10 分钟",tag:"Nodes",type:"custom"},
  {id:"disconnect_clicked",label:"Disconnect Clicked",labelZh:"点击断开连接",tag:"Nodes",type:"custom"},
  {id:"connect_node_clicked",label:"Connect Node Clicked",labelZh:"点击连接节点",tag:"Nodes",type:"custom"},
  {id:"smart_mode_opened",label:"Smart Mode Opened",labelZh:"打开智能模式",tag:"Nodes",type:"custom"},
  {id:"feedback_submitted",label:"Feedback Submitted",labelZh:"提交反馈",tag:"Nodes",type:"custom"},
  {id:"referral_entry_seen",label:"Referral Entry Viewed",labelZh:"查看推荐入口",tag:"Referral",type:"pageview"},
  {id:"referral_link_shared",label:"Referral Link Shared",labelZh:"分享推荐链接",tag:"Referral",type:"custom"},
  {id:"referral_poster_shared",label:"Referral Poster Shared",labelZh:"分享推荐海报",tag:"Referral",type:"custom"},
  {id:"paywall_viewed",label:"Paywall Viewed",labelZh:"查看付费墙",tag:"Monetisation",type:"pageview"},
  {id:"plan_selected",label:"Plan Selected",labelZh:"选择套餐",tag:"Monetisation",type:"custom"},
  {id:"payment_method_viewed",label:"Payment Method Viewed",labelZh:"查看支付方式",tag:"Monetisation",type:"pageview"},
  {id:"payment_initiated",label:"Payment Initiated",labelZh:"发起支付",tag:"Monetisation",type:"custom"},
  {id:"payment_completed",label:"Payment Completed",labelZh:"支付成功",tag:"Monetisation",type:"custom"},
  {id:"plan_expired_toast_clicked",label:"Plan Expired Toast Clicked",labelZh:"套餐到期提示已点击",tag:"Monetisation",type:"custom"},
  {id:"task_centre_opened",label:"Task Centre Viewed",labelZh:"查看任务中心",tag:"Tasks",type:"pageview"},
  {id:"comment_task_selected",label:"Comment Task Selected",labelZh:"选择评论任务",tag:"Tasks",type:"custom"},
  {id:"task_completed",label:"Task Completed",labelZh:"完成任务",tag:"Tasks",type:"custom"},
  {id:"proof_submitted",label:"Proof Submitted",labelZh:"提交证明",tag:"Tasks",type:"custom"},
  {id:"binding_task_selected",label:"Email Binding Task Selected",labelZh:"选择绑定任务",tag:"Tasks",type:"custom"},
  {id:"sharing_task_selected",label:"Sharing Task Selected",labelZh:"选择分享任务",tag:"Tasks",type:"custom"},
  {id:"follow_task_selected",label:"Follow Task Selected",labelZh:"选择关注任务",tag:"Tasks",type:"custom"},
  {id:"ai_chat_page_viewed",label:"AI Chat Page Viewed",labelZh:"查看AI聊天页面",tag:"Image Generation",type:"pageview"},
  {id:"image_generation_requested",label:"Image Generation Requested",labelZh:"发起图像生成",tag:"Image Generation",type:"custom"},
  {id:"image_generation_confirmed",label:"Image Generation Confirmation Selected",labelZh:"确认图像生成",tag:"Image Generation",type:"custom"},
  {id:"use_30pts_unlock_selected",label:"Use 30 Points Unlock Selected",labelZh:"选择30积分解锁",tag:"Image Generation",type:"custom"},
  {id:"earn_pts_via_tasks_selected",label:"Earn Points via Tasks Selected",labelZh:"选择任务赚积分",tag:"Image Generation",type:"custom"},
  {id:"support_entry_viewed",label:"Support Entry Viewed",labelZh:"查看客服入口",tag:"Support",type:"pageview"},
  {id:"ticket_submitted",label:"Ticket Submitted",labelZh:"提交工单",tag:"Support",type:"custom"},
  {id:"faq_card_clicked",label:"FAQ Card Clicked",labelZh:"点击FAQ卡片",tag:"Support",type:"custom"},
  {id:"faq_search_used",label:"FAQ Search Used",labelZh:"使用FAQ搜索",tag:"Support",type:"custom"},
  {id:"ticket_list_viewed",label:"Ticket List Viewed",labelZh:"查看工单列表",tag:"Support",type:"pageview"},
];
 
const TYPE_COLORS={pageview:"#0f766e",custom:"#7c3aed"};
const TYPE_LABELS={pageview:"Page View",custom:"Custom Event"};

const genSeriesColor=(index)=>{const colors=["#3A3A3A","#5BA3D0","#6BA085","#8FA5C4","#C4A5A8","#A89070","#2F2F2F","#4A90B8","#70A89A","#7FA3D0","#D0A5B0","#9B8B75"];return colors[index%colors.length];};
const TAG_COLORS={
  Registration:"#5BA3D0",Nodes:"#3A3A3A",Referral:"#6BA085",
  Monetisation:"#A89070",Tasks:"#70A89A","Image Generation":"#8FA5C4",Support:"#C4A5A8",
};
 
const BUILT_IN_PRESETS={
  registration:{label:"Registration",labelZh:"注册流程",builtIn:true,
    steps:["account_created","referral_code_entered","onboarding_started","first_page_viewed"],
    others:["email_binded"]},
  nodes:{label:"Node Usage",labelZh:"节点使用",builtIn:true,
    steps:["server_list_viewed","node_selected","node_connected","vpn_session_1min","vpn_session_10min","disconnect_clicked"],
    others:["node_connection_failed","connect_node_clicked","smart_mode_opened","feedback_submitted"]},
  referral:{label:"Referral",labelZh:"推荐流程",builtIn:true,
    steps:["referral_entry_seen","referral_link_shared"],
    others:["referral_poster_shared"]},
  monetisation:{label:"Monetisation",labelZh:"变现流程",builtIn:true,
    steps:["paywall_viewed","plan_selected","payment_method_viewed","payment_initiated","payment_completed"],
    others:["plan_expired_toast_clicked"]},
  tasks:{label:"Tasks",labelZh:"任务流程",builtIn:true,
    steps:["task_centre_opened","comment_task_selected","task_completed","proof_submitted"],
    others:["binding_task_selected","sharing_task_selected","follow_task_selected"]},
  image_generation:{label:"Image Generation",labelZh:"图像生成",builtIn:true,
    steps:["ai_chat_page_viewed","image_generation_requested","image_generation_confirmed"],
    others:["use_30pts_unlock_selected","earn_pts_via_tasks_selected"]},
  support:{label:"Support System",labelZh:"客服系统",builtIn:true,
    steps:[],
    others:["support_entry_viewed","ticket_submitted","faq_card_clicked","faq_search_used","ticket_list_viewed"]},
};
 
const BASE_COUNTS={
  account_created:21200,referral_code_entered:7820,onboarding_started:24200,first_page_viewed:18900,email_binded:9400,
  server_list_viewed:18600,node_selected:16200,node_connected:14800,node_connection_failed:1800,vpn_session_1min:10800,vpn_session_10min:8400,disconnect_clicked:7200,
  connect_node_clicked:14200,smart_mode_opened:4200,feedback_submitted:1800,
  referral_entry_seen:9800,referral_link_shared:3920,referral_poster_shared:1640,
  paywall_viewed:10800,plan_selected:6400,payment_method_viewed:4200,payment_initiated:4820,payment_completed:2890,plan_expired_toast_clicked:1840,
  task_centre_opened:8200,comment_task_selected:3200,task_completed:3280,proof_submitted:2800,
  binding_task_selected:2100,sharing_task_selected:2600,follow_task_selected:4200,
  ai_chat_page_viewed:6400,image_generation_requested:4200,image_generation_confirmed:3100,generated_image_viewed:2900,
  use_30pts_unlock_selected:1200,earn_pts_via_tasks_selected:980,
  support_entry_viewed:5600,ticket_submitted:1200,faq_card_clicked:3800,faq_search_used:2400,ticket_list_viewed:900,
};
 
const AVG_TIME={
  account_created:0.3,referral_code_entered:0.5,onboarding_started:0.05,first_page_viewed:0.08,email_binded:0.2,
  server_list_viewed:0.05,node_selected:0.08,node_connected:0.01,vpn_session_1min:0.02,vpn_session_10min:0.15,disconnect_clicked:0.03,
  connect_node_clicked:0.05,smart_mode_opened:0.1,feedback_submitted:2.0,
  referral_entry_seen:6.0,referral_link_shared:0.5,referral_poster_shared:0.8,
  paywall_viewed:4.0,plan_selected:0.1,payment_method_viewed:0.12,payment_initiated:0.08,payment_completed:0.05,plan_expired_toast_clicked:720.0,
  task_centre_opened:1.5,comment_task_selected:0.15,task_completed:0.8,proof_submitted:1.0,
  binding_task_selected:0.2,sharing_task_selected:0.2,follow_task_selected:0.2,
  ai_chat_page_viewed:0.3,image_generation_requested:0.5,image_generation_confirmed:0.2,generated_image_viewed:1.2,
  use_30pts_unlock_selected:0.1,earn_pts_via_tasks_selected:0.1,
  support_entry_viewed:2.0,ticket_submitted:5.0,faq_card_clicked:1.5,faq_search_used:2.5,ticket_list_viewed:1.0,
};
 
const DEFAULT_DESCRIPTIONS={
  account_created:"A new user account was successfully created.",
  referral_code_entered:"User entered a referral code during registration.",
  onboarding_started:"User began the onboarding flow for the first time.",
  first_page_viewed:"User viewed the first page after account creation.",
  email_binded:"User linked an email address to their account.",
  server_list_viewed:"User opened the list of available VPN servers.",
  node_selected:"User selected a specific VPN node to connect to.",
  node_connected:"VPN tunnel was established successfully. Fires immediately when the connection handshake completes.",
  node_connection_failed:"VPN connection attempt failed due to timeout, auth error, or server unavailability.",
  vpn_session_1min:"User maintained an active VPN session for over 1 minute.",
  vpn_session_10min:"User maintained an active VPN session for over 10 minutes.",
  disconnect_clicked:"User clicked the disconnect button to end their VPN session.",
  connect_node_clicked:"User clicked to initiate a connection to a VPN node.",
  smart_mode_opened:"User opened the Smart Mode configuration panel.",
  feedback_submitted:"User submitted feedback after a VPN session.",
  referral_entry_seen:"User saw the referral entry point in the app.",
  referral_link_shared:"User shared their unique referral link.",
  referral_poster_shared:"User shared a referral poster via social or messaging.",
  paywall_viewed:"User was shown the subscription paywall screen.",
  plan_selected:"User selected a subscription plan on the paywall.",
  payment_method_viewed:"User viewed the available payment method options.",
  payment_initiated:"User started the payment process.",
  payment_completed:"User successfully completed a payment.",
  plan_expired_toast_clicked:"User clicked the plan expired toast notification to renew.",
  task_centre_opened:"User opened the Task Centre to view available tasks.",
  comment_task_selected:"User selected a comment-type task to complete.",
  task_completed:"User completed a task in the Task Centre.",
  proof_submitted:"User submitted proof of task completion.",
  binding_task_selected:"User selected a binding-type task (e.g. link account).",
  sharing_task_selected:"User selected a sharing-type task.",
  follow_task_selected:"User selected a follow-type task (e.g. follow on social media).",
  ai_chat_page_viewed:"User navigated to the AI Chat / Image Generation page.",
  image_generation_requested:"User submitted a prompt to generate an image.",
  image_generation_confirmed:"User confirmed the image generation action.",
  generated_image_viewed:"User viewed the generated image result.",
  use_30pts_unlock_selected:"User chose to spend 30 points to unlock an image.",
  earn_pts_via_tasks_selected:"User chose to earn points by completing tasks.",
  support_entry_viewed:"User viewed the support entry point in the app.",
  ticket_submitted:"User submitted a support ticket.",
  faq_card_clicked:"User clicked on an FAQ card to read the answer.",
  faq_search_used:"User used the search function within FAQ.",
  ticket_list_viewed:"User viewed their list of submitted support tickets.",
};
 
const BREAK_DEFS={
  none:[],
  device:[{key:"windows",label:"Windows",labelZh:"Windows",mult:0.38},{key:"ios",label:"iOS",labelZh:"iOS",mult:0.28},{key:"android",label:"Android",labelZh:"Android",mult:0.22},{key:"macos",label:"macOS",labelZh:"macOS",mult:0.08},{key:"linux",label:"Linux",labelZh:"Linux",mult:0.04}],
  status:[{key:"base",label:"BASE",labelZh:"BASE",mult:0.12},{key:"free",label:"Free",labelZh:"免费",mult:0.60},{key:"vip",label:"VIP",labelZh:"VIP",mult:0.18},{key:"svip",label:"SVIP",labelZh:"SVIP",mult:0.10}],
  region:[{key:"north",label:"North China",labelZh:"华北",mult:0.28},{key:"east",label:"East China",labelZh:"华东",mult:0.32},{key:"south",label:"South China",labelZh:"华南",mult:0.22},{key:"central",label:"Central China",labelZh:"华中",mult:0.10},{key:"west",label:"West China",labelZh:"西部",mult:0.08}],
};
const BASELINE={key:"all",label:"Baseline",labelZh:"基准线",mult:1};
const SEG_CURVES={
  all:[1.00,0.88,0.74,0.61,0.52,0.44,0.38,0.33,0.29,0.25],
  windows:[1.00,0.91,0.80,0.69,0.61,0.54,0.48,0.43,0.39,0.35],
  ios:[1.00,0.85,0.67,0.51,0.40,0.32,0.26,0.21,0.18,0.15],
  android:[1.00,0.82,0.63,0.47,0.36,0.28,0.22,0.18,0.15,0.12],
  macos:[1.00,0.93,0.84,0.76,0.68,0.61,0.55,0.50,0.45,0.41],
  linux:[1.00,0.79,0.58,0.41,0.30,0.22,0.16,0.12,0.09,0.07],
  base:[1.00,0.45,0.22,0.12,0.07,0.04,0.03,0.02,0.02,0.01],
  free:[1.00,0.80,0.59,0.43,0.32,0.24,0.18,0.14,0.11,0.09],
  vip:[1.00,0.92,0.82,0.73,0.65,0.58,0.52,0.47,0.42,0.38],
  svip:[1.00,0.95,0.89,0.83,0.77,0.71,0.66,0.61,0.57,0.53],
  north:[1.00,0.87,0.73,0.60,0.50,0.42,0.36,0.31,0.27,0.23],
  east:[1.00,0.90,0.78,0.66,0.57,0.49,0.43,0.38,0.33,0.29],
  south:[1.00,0.86,0.71,0.58,0.48,0.40,0.34,0.29,0.25,0.21],
  central:[1.00,0.83,0.66,0.52,0.41,0.33,0.27,0.22,0.18,0.15],
  west:[1.00,0.80,0.62,0.48,0.37,0.29,0.23,0.18,0.15,0.12],
};
const SEGMENTS=[
  {key:"vip_users",label:"VIP Users",labelZh:"VIP用户",slug:"seg.vip_users",desc:"High-value customers with premium engagement",descZh:"高价值优质用户",users:12400,rules:3,mult:0.88},
  {key:"churn_risk",label:"Churn Risk",labelZh:"流失风险",slug:"seg.churn_risk",desc:"Users showing declining activity patterns",descZh:"活跃度下降的用户",users:8900,rules:5,mult:0.42},
  {key:"beta_testers",label:"Beta Testers",labelZh:"内测用户",slug:"seg.beta_testers",desc:"Early adopters opted into experimental features",descZh:"参与实验功能的早期用户",users:3200,rules:2,mult:0.85},
  {key:"internal_employees",label:"Internal Employees",labelZh:"内部员工",slug:"seg.internal_employees",desc:"Company staff accounts for testing",descZh:"用于测试的公司员工账户",users:450,rules:1,mult:0.95},
  {key:"high_usage",label:"High Usage",labelZh:"高频用户",slug:"seg.high_usage",desc:"Power users with above-average consumption",descZh:"高于平均消费的重度用户",users:18700,rules:4,mult:0.91},
];
 
function CustomSelect({value,onChange,options}){
  const [open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    if(!open)return;
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);
  const selected=options.find(o=>o.value===value);
  return(
    <div ref={ref} style={{position:"relative",userSelect:"none"}}>
      <div onClick={()=>setOpen(v=>!v)}
        style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:6,border:`1.5px solid ${open?C.accent:C.border2}`,background:C.card,cursor:"pointer",fontSize:12,color:C.text,boxShadow:open?`0 0 0 2px ${C.accentLight}`:"none",transition:"border-color 0.15s"}}>
        <div style={{display:"flex",flexDirection:"column",gap:1,minWidth:0}}>
          <span style={{fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected?selected.label:""}</span>
          {selected&&selected.desc&&<span style={{fontSize:10,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.desc}</span>}
        </div>
        <span style={{fontSize:10,color:C.muted,marginLeft:8,flexShrink:0,display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.15s"}}>▼</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:500,background:C.card,border:`1px solid ${C.border2}`,borderRadius:6,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",overflow:"hidden"}}>
          {options.map(o=>(
            <div key={o.value} onClick={()=>{onChange(o.value);setOpen(false);}}
              style={{padding:"9px 12px",fontSize:12,cursor:"pointer",fontWeight:o.value===value?600:400,color:o.value===value?C.accent:C.text,background:o.value===value?C.accentBg:C.card,borderLeft:`3px solid ${o.value===value?C.accent:"transparent"}`}}
              onMouseEnter={e=>{if(o.value!==value)e.currentTarget.style.background="#f9fafb";}}
              onMouseLeave={e=>{if(o.value!==value)e.currentTarget.style.background=C.card;}}>
              <div>{o.label}</div>
              {o.desc&&<div style={{fontSize:10,color:C.muted,marginTop:2,fontWeight:400}}>{o.desc}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
const Card=({children,style={}})=>(
  <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",...style}}>{children}</div>
);
const Btn=({children,onClick,disabled,style={}})=>(
  <button onClick={onClick} disabled={disabled} style={{padding:"7px 14px",borderRadius:6,fontSize:11,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,border:`1px solid ${C.border2}`,background:C.card,color:C.text3,...style}}>{children}</button>
);
const FieldLabel=({children})=>(
  <div style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>{children}</div>
);
 
function CollapsibleSection({label,badge,badgeColor,children,defaultOpen=false}){
  const [open,setOpen]=useState(defaultOpen);
  return (
    <div>
      <button onClick={()=>setOpen(v=>!v)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:6,border:`1px solid ${open?C.accent:C.border2}`,background:open?C.accentBg:C.bg,cursor:"pointer",color:open?C.accent:C.text3,fontSize:11,fontWeight:600,transition:"all 0.15s"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:10}}>{open?"▼":"▶"}</span>
          <span>{label}</span>
          {badge!=null&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:open?C.accent:(badgeColor||C.muted),color:"#fff",fontWeight:700,lineHeight:1.6}}>{badge}</span>}
        </div>
      </button>
      {open&&(
        <div style={{marginTop:4,padding:"10px 10px 12px",border:`1px solid ${C.border}`,borderRadius:6,background:C.card,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          {children}
        </div>
      )}
    </div>
  );
}
 
function SegmentRow({seg,active,onToggle,lang,onEnter,onLeave}){
  return (
    <div onClick={onToggle}
      onMouseEnter={e=>{const r=e.currentTarget.getBoundingClientRect();onEnter(seg,r.top+r.height/2,r.right+10);}}
      onMouseLeave={onLeave}
      style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:6,cursor:"pointer",border:`1px solid ${active?C.accent:C.border}`,background:active?C.accentBg:"transparent",transition:"all 0.1s"}}>
      <div style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${active?C.accent:C.border2}`,background:active?C.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {active&&<span style={{color:"#fff",fontSize:9,lineHeight:1,fontWeight:800}}>✓</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:active?600:400,color:active?C.accent:C.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="zh"?seg.labelZh:seg.label}</div>
        <div style={{fontSize:9,color:C.muted,fontFamily:"monospace",marginTop:1}}>{seg.slug}</div>
      </div>
    </div>
  );
}
 
function SegmentFilterContent({activeFilters,toggleFilter,setActiveFilters,autoRun,lang,t,onEnter,onLeave}){
  const [q,setQ]=useState("");
  const filtered=SEGMENTS.filter(s=>q===""||s.label.toLowerCase().includes(q.toLowerCase())||s.slug.includes(q));
  return (
    <div>
      {activeFilters.length>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
          {activeFilters.map(key=>{const seg=SEGMENTS.find(s=>s.key===key);return seg?(
            <div key={key} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 4px 2px 8px",borderRadius:4,background:C.accentBg,border:`1px solid ${C.accentLight}`,fontSize:10,color:C.accent,fontWeight:600}}>
              {lang==="zh"?seg.labelZh:seg.label}
              <span onClick={()=>toggleFilter(key)} style={{cursor:"pointer",padding:"1px 4px",color:C.muted,fontSize:11}}>✕</span>
            </div>
          ):null;})}
          <button onClick={()=>{setActiveFilters([]);autoRun();}} style={{fontSize:10,color:C.danger,background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}}>{t.clearFilters}</button>
        </div>
      )}
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={{width:"100%",padding:"5px 8px",borderRadius:5,border:`1px solid ${C.border2}`,fontSize:11,color:C.text,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
      <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
        {filtered.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:"10px 0"}}>{t.noResults}</div>}
        {filtered.map(seg=><SegmentRow key={seg.key} seg={seg} lang={lang} active={activeFilters.includes(seg.key)} onToggle={()=>toggleFilter(seg.key)} onEnter={onEnter} onLeave={onLeave}/>)}
      </div>
    </div>
  );
}
 
function PresetPanelContent({customPresets,loadingPresets,activePreset,expandedPreset,setExpandedPreset,loadPreset,setDeleteConfirm,setShowSaveModal,steps,lang,t}){
  const [q,setQ]=useState("");
  const allEntries=useMemo(()=>[
    ...Object.keys(BUILT_IN_PRESETS).map(key=>({key,preset:BUILT_IN_PRESETS[key],isCustom:false})),
    ...Object.keys(customPresets).map(key=>({key,preset:customPresets[key],isCustom:true})),
  ],[customPresets]);
  const filtered=allEntries.filter(function(entry){
    const p=entry.preset;
    const label=lang==="zh"?(p.labelZh||p.label):p.label;
    return q===""||label.toLowerCase().includes(q.toLowerCase());
  });
  const fmtDate=ts=>{if(!ts)return null;const d=new Date(ts);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
  const pLabel=p=>lang==="zh"?(p.labelZh||p.label):p.label;
  const evLabel=id=>{const ev=ALL_EVENTS.find(e=>e.id===id);return lang==="zh"?(ev?ev.labelZh:id):(ev?ev.label:id);};
  return (
    <div>
      {loadingPresets&&<div style={{fontSize:12,color:C.muted,marginBottom:8}}>{t.loading}</div>}
      {!loadingPresets&&(
        <>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search presets…" style={{width:"100%",padding:"5px 8px",borderRadius:5,border:`1px solid ${C.border2}`,fontSize:11,color:C.text,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <div style={{maxHeight:300,overflowY:"auto",display:"flex",flexDirection:"column"}}>
            {filtered.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:"10px 0"}}>{t.noResults}</div>}
            {filtered.map(function(entry){
              const key=entry.key,p=entry.preset,isCustom=entry.isCustom;
              const active=activePreset===key;
              const expanded=expandedPreset===key;
              const firstStepId=p.steps&&p.steps[0];
              const firstEv=firstStepId?ALL_EVENTS.find(function(e){return e.id===firstStepId;}):null;
              const ac=isCustom?p.color:(TAG_COLORS[firstEv?firstEv.tag:""]||C.accent);
              const savedDate=isCustom&&p.savedAt?fmtDate(p.savedAt):null;
              const hasNoSteps=!p.steps||p.steps.length===0;
              if(hasNoSteps&&!isCustom)return null;
              return (
                <div key={key} style={{display:"flex",gap:4,marginBottom:4}}>
                  <div style={{flex:1,borderRadius:7,border:`1px solid ${active?ac:expanded?ac+"60":C.border}`,overflow:"hidden",background:active?ac+"0d":C.card}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",cursor:"pointer"}} onClick={()=>setExpandedPreset(expanded?null:key)}>
                      <div style={{width:6,height:6,borderRadius:1,background:active?ac:C.muted,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:active?600:400,color:active?ac:C.text3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pLabel(p)}</div>
                        {savedDate&&<div style={{fontSize:9,color:C.muted,marginTop:1}}>Saved {savedDate}</div>}
                      </div>
                      <span style={{fontSize:10,color:C.muted,marginRight:4,flexShrink:0}}>{hasNoSteps?"–":(p.steps.length+" steps")}</span>
                      <span style={{fontSize:10,color:expanded?ac:C.muted,flexShrink:0}}>{expanded?"▲":"▼"}</span>
                    </div>
                    {expanded&&(
                      <div style={{borderTop:`1px solid ${ac}25`,padding:"8px 10px 10px",background:ac+"07"}}>
                        {hasNoSteps?(
                          <div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginBottom:8}}>No preset steps — use "Others" events to build a funnel.</div>
                        ):(
                          <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:6}}>
                            {p.steps.map(function(id,i){return(
                              <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                                <div style={{width:15,height:15,borderRadius:3,background:ac,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                                <span style={{fontSize:11,color:C.text2}}>{evLabel(id)}</span>
                              </div>
                            );})}
                          </div>
                        )}
                        {!hasNoSteps&&(
                          <button onClick={()=>loadPreset(key)} style={{width:"100%",padding:"6px",borderRadius:5,border:"none",background:ac,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>{active?t.loaded:t.loadFunnel}</button>
                        )}
                      </div>
                    )}
                  </div>
                  {isCustom&&(
                    <button onClick={()=>setDeleteConfirm(key)} style={{padding:"5px 7px",borderRadius:6,border:`1px solid ${C.border}`,background:C.card,cursor:"pointer",fontSize:12,color:C.muted,alignSelf:"flex-start",marginTop:1}}
                      onMouseEnter={e=>e.currentTarget.style.color=C.danger} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>✕</button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      <button onClick={()=>setShowSaveModal(true)} disabled={steps.length<2}
        style={{width:"100%",marginTop:4,padding:"6px",borderRadius:6,border:`1px dashed ${steps.length<2?C.border:C.accent}`,background:steps.length<2?C.bg:C.accentBg,color:steps.length<2?C.muted:C.accent,fontSize:11,fontWeight:500,cursor:steps.length<2?"not-allowed":"pointer"}}>
        {t.saveCurrentAsPreset}
      </button>
    </div>
  );
}
 
function StepInfoPopover({ev,descriptions,setDescriptions,onClose,onView,onEditingChange}){
  const lang=useLang();const t=useT();
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState("");
  const taRef=useRef();
  const desc=descriptions[ev.id]||"";
  const tagColor=TAG_COLORS[ev.tag]||C.muted;
  const startEdit=()=>{setDraft(desc);setEditing(true);if(onEditingChange)onEditingChange(true);setTimeout(()=>{if(taRef.current)taRef.current.focus();},30);};
  const stopEdit=()=>{setEditing(false);if(onEditingChange)onEditingChange(false);};
  const saveEdit=()=>{setDescriptions(function(p){const n={...p};n[ev.id]=draft.trim();return n;});stopEdit();};
  return (
    <div style={{width:260,background:C.card,borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,0.16)",border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderBottom:`1px solid ${C.border}`,background:"#f9fafb"}}>
        <span style={{fontSize:9,fontWeight:700,color:tagColor,textTransform:"uppercase",letterSpacing:"0.07em",padding:"2px 7px",borderRadius:3,background:tagColor+"15"}}>{ev.tag}</span>
        <div style={{display:"flex",gap:2}}>
          <button onClick={startEdit} style={{fontSize:11,color:C.accent,background:"none",border:`1px solid ${C.accentLight}`,borderRadius:4,cursor:"pointer",fontWeight:600,padding:"3px 9px"}}>Edit</button>
          <button onClick={onView} style={{fontSize:11,color:C.accent,background:"none",border:`1px solid ${C.accentLight}`,borderRadius:4,cursor:"pointer",fontWeight:600,padding:"3px 9px",display:"flex",alignItems:"center",gap:3}}>View <span style={{fontSize:10}}>↗</span></button>
        </div>
      </div>
      <div style={{padding:"11px 13px 13px"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
          <div style={{width:8,height:8,borderRadius:2,background:tagColor,flexShrink:0}}/>
          <span style={{fontSize:13,fontWeight:700,color:C.text}}>{lang==="zh"?ev.labelZh:ev.label}</span>
        </div>
        <div style={{fontSize:10,fontFamily:"monospace",color:C.muted,marginBottom:9,paddingLeft:15}}>{ev.id}</div>
        {editing?(
          <>
            <textarea ref={taRef} value={draft} onChange={e=>setDraft(e.target.value)} rows={3}
              style={{width:"100%",padding:"6px 8px",borderRadius:5,border:`1.5px solid ${C.accent}`,fontSize:11,color:C.text,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5}}/>
            <div style={{display:"flex",gap:6,marginTop:6,justifyContent:"flex-end"}}>
              <button onClick={stopEdit} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border2}`,background:C.card,color:C.muted,fontSize:11,cursor:"pointer"}}>{t.cancel}</button>
              <button onClick={saveEdit} style={{padding:"4px 12px",borderRadius:5,border:"none",background:C.accent,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>Save</button>
            </div>
          </>
        ):(
          <div style={{fontSize:11,color:desc?C.text3:C.muted,fontStyle:desc?"normal":"italic",lineHeight:1.6,cursor:"pointer"}} onClick={startEdit}>
            {desc||t.addDesc}
          </div>
        )}
      </div>
    </div>
  );
}
 
function SavePresetModal({steps,onSave,onClose}){
  const t=useT();const lang=useLang();
  const [name,setName]=useState("");
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  const evLabel=id=>{const ev=ALL_EVENTS.find(e=>e.id===id);return lang==="zh"?(ev?ev.labelZh:id):(ev?ev.label:id);};
  const handleSave=async()=>{
    if(!name.trim()){setErr(t.pleaseName);return;}
    setSaving(true);
    const preset={label:name.trim(),color:PRESET_COLORS[0],steps,savedAt:Date.now()};
    try{
      let all={};
      try{const ex=await localStorage.get(STORAGE_KEY);if(ex&&ex.value)all=JSON.parse(ex.value);}catch(_){}
      const id="custom_"+Date.now();all[id]=preset;
      await localStorage.set(STORAGE_KEY,JSON.stringify(all));
      onSave(id,preset);onClose();
    }catch(e){setErr(t.failedSave);}
    setSaving(false);
  };
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.3)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.card,borderRadius:10,padding:"24px 28px",width:380,boxShadow:"0 8px 30px rgba(0,0,0,0.12)",border:`1px solid ${C.border}`}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>{t.saveAsCustom}</div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{t.presetName}</div>
          <input value={name} onChange={e=>{setName(e.target.value);setErr("");}} placeholder={t.presetNamePh}
            style={{width:"100%",padding:"8px 12px",borderRadius:6,border:`1.5px solid ${err?C.danger:C.border2}`,fontSize:12,color:C.text,outline:"none",boxSizing:"border-box"}}/>
          {err&&<div style={{fontSize:10,color:C.danger,marginTop:4}}>{err}</div>}
        </div>
        <div style={{marginBottom:16,background:C.bg,borderRadius:6,padding:"10px 12px"}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{t.stepsPreview}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {steps.map(function(id,i){return <span key={i} style={{fontSize:9,padding:"2px 7px",borderRadius:3,background:C.accentLight,color:C.accent,fontWeight:600}}>{i+1}. {evLabel(id)}</span>;})}
          </div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={onClose}>{t.cancel}</Btn>
          <button onClick={handleSave} disabled={saving} style={{padding:"7px 20px",borderRadius:6,border:"none",background:C.accent,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",opacity:saving?0.7:1}}>
            {saving?t.saving:t.savePreset}
          </button>
        </div>
      </div>
    </div>
  );
}
 
function InlineAddStep({addStep,lang,t,onRowEnter,onRowLeave}){
  const [open,setOpen]=useState(false);
  const [q,setQ]=useState("");
  const [tagFilter,setTagFilter]=useState("All");
  const [typeFilter,setTypeFilter]=useState("All");
  const ref=useRef();
  useEffect(()=>{
    if(!open)return;
    const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setQ("");onRowLeave();}};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);
  const typeOpts=[
    {key:"All",label:"All Types",color:C.muted},
    {key:"pageview",label:"Page Views",color:TYPE_COLORS.pageview},
    {key:"custom",label:"Custom Events",color:TYPE_COLORS.custom},
  ];
  const filtered=ALL_EVENTS.filter(e=>{
    const matchQ=q===""||e.label.toLowerCase().includes(q.toLowerCase())||e.labelZh.includes(q)||e.tag.toLowerCase().includes(q.toLowerCase());
    const matchT=tagFilter==="All"||e.tag===tagFilter;
    const matchType=typeFilter==="All"||e.type===typeFilter;
    return matchQ&&matchT&&matchType;
  });
  return (
    <div ref={ref} style={{position:"relative",marginTop:8}}>
      <button onClick={()=>{setOpen(v=>!v);setQ("");onRowLeave();}}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"7px 12px",borderRadius:6,cursor:"pointer",border:`1.5px dashed ${open?C.accent:C.border2}`,background:open?C.accentBg:C.bg,color:open?C.accent:C.muted,fontSize:11,fontWeight:500,transition:"all 0.15s"}}>
        <span style={{fontSize:14,lineHeight:1}}>+</span>{t.addSteps}
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:400,background:C.card,border:`1px solid ${C.border2}`,borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.13)",overflow:"hidden"}}>
          <div style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:6,flexDirection:"column"}}>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder={t.searchSteps}
              style={{width:"100%",padding:"6px 9px",borderRadius:5,border:`1px solid ${C.border2}`,fontSize:11,color:C.text,outline:"none",boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:3}}>
              {typeOpts.map(opt=>(
                <button key={opt.key} onClick={()=>{setTypeFilter(opt.key);setTagFilter("All");}}
                  style={{padding:"2px 9px",borderRadius:4,border:`1px solid ${typeFilter===opt.key?(opt.color===C.muted?C.accent:opt.color):C.border}`,background:typeFilter===opt.key?(opt.color===C.muted?C.accent:opt.color)+"18":"transparent",color:typeFilter===opt.key?(opt.color===C.muted?C.accent:opt.color):C.muted,fontSize:10,fontWeight:typeFilter===opt.key?700:400,cursor:"pointer"}}>
                  {opt.label}
                </button>
              ))}
            </div>
            {typeFilter!=="pageview"&&typeFilter!=="custom"&&(
              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                {["All",...Object.keys(TAG_COLORS)].map(tg=>(
                  <button key={tg} onClick={()=>setTagFilter(tg)}
                    style={{padding:"2px 8px",borderRadius:4,border:`1px solid ${tagFilter===tg?(TAG_COLORS[tg]||C.accent):C.border}`,background:tagFilter===tg?(TAG_COLORS[tg]||C.accent)+"15":"transparent",color:tagFilter===tg?(TAG_COLORS[tg]||C.accent):C.muted,fontSize:10,fontWeight:tagFilter===tg?700:400,cursor:"pointer"}}>
                    {tg}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{maxHeight:240,overflowY:"auto",padding:"4px 6px",display:"flex",flexDirection:"column",gap:1}}>
            {filtered.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:"10px 0"}}>{t.noResults}</div>}
            {filtered.map(function(ev){
              const tagColor=TAG_COLORS[ev.tag]||C.muted;
              const typeColor=TYPE_COLORS[ev.type]||C.muted;
              const typeLabel=TYPE_LABELS[ev.type]||ev.type;
              return (
                <div key={ev.id}
                  onClick={()=>{addStep(ev.id);setOpen(false);setQ("");onRowLeave();}}
                  onMouseEnter={e=>{e.currentTarget.style.background=C.accentBg;onRowEnter(ev,e.currentTarget.getBoundingClientRect());}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";onRowLeave();}}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:5,cursor:"pointer",background:"transparent"}}>
                  <div style={{width:5,height:5,borderRadius:1,background:tagColor,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:C.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="zh"?ev.labelZh:ev.label}</div>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
                      <span style={{fontSize:9,color:tagColor,fontWeight:600}}>{ev.tag}</span>
                      <span style={{fontSize:9,color:C.muted}}>·</span>
                      <span style={{fontSize:9,padding:"0px 5px",borderRadius:3,background:typeColor+"15",color:typeColor,fontWeight:600}}>{typeLabel}</span>
                    </div>
                  </div>
                  <span style={{fontSize:13,color:C.accent,fontWeight:700,flexShrink:0}}>+</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
 
function MultiLineTrendChart({trendData,steps,fromStep,toStep,setFromStep,setToStep,result,lang,breakdownData,breakBy}){
  const [tooltip,setTooltip]=useState(null);
  const svgRef=useRef();
  const pairKey="Step "+fromStep+"→"+toStep;
  const lines=useMemo(()=>{
    if(!breakdownData||!breakdownData.length)return[];
    if(breakBy==="none") return breakdownData.filter(r=>r.key==="all");
    return breakdownData.filter(r=>r.key!=="all");
  },[breakdownData,breakBy]);
  if(!trendData.length||steps.length<2||!lines.length)return null;
  const W=Math.max(500,trendData.length*38);
  const H=280;const PL=44,PR=24,PT=16,PB=32;
  const innerW=W-PL-PR,innerH=H-PT-PB;
  const yTicks=[0,20,40,60,80,100];
  const xScale=i=>PL+(trendData.length<2?innerW/2:i*(innerW/(trendData.length-1)));
  const yScale=v=>PT+innerH-(v/100)*innerH;
  const every=Math.ceil(trendData.length/10);
  const stepOptions=steps.map((id,i)=>{
    const ev=ALL_EVENTS.find(e=>e.id===id);
    return {value:i+1,label:"Step "+(i+1)+(ev?" · "+(lang==="zh"?ev.labelZh:ev.label):"")};
  });
  const baselineTotal=breakdownData.find(r=>r.key==="all");
  const baseVal=baselineTotal&&baselineTotal.stepData[toStep-1]&&baselineTotal.stepData[fromStep-1]
    ?baselineTotal.stepData[toStep-1].val/baselineTotal.stepData[fromStep-1].val*100:50;
  const lineSeriesMap=useMemo(()=>{
    return lines.map(row=>{
      const rowFromVal=row.stepData[fromStep-1]?row.stepData[fromStep-1].val:1;
      const rowToVal=row.stepData[toStep-1]?row.stepData[toStep-1].val:0;
      const rowBase=rowToVal/rowFromVal*100;
      const ratio=baseVal>0?rowBase/baseVal:1;
      return {
        ...row,
        points:trendData.map((d,i)=>{
          const overall=d[pairKey]||0;
          const noise=Math.sin(i*1.3+row.key.length*0.7)*2.5+Math.cos(i*0.9+row.key.charCodeAt(0)*0.01)*1.5;
          return Math.max(1,Math.min(99,parseFloat((overall*ratio+noise).toFixed(1))));
        }),
      };
    });
  },[lines,trendData,fromStep,toStep,pairKey,baseVal]);
  const handleMouseMove=e=>{
    if(!svgRef.current)return;
    const rect=svgRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left;
    if(mx<PL||mx>W-PR){setTooltip(null);return;}
    const idx=Math.max(0,Math.min(trendData.length-1,Math.round((mx-PL)/innerW*(trendData.length-1))));
    const wrapperRect=svgRef.current.parentElement.getBoundingClientRect();
    const relX=e.clientX-wrapperRect.left;
    const relY=e.clientY-wrapperRect.top;
    setTooltip({idx,x:xScale(idx),label:trendData[idx].label,relX,relY});
  };
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <span style={{fontSize:12,fontWeight:600,color:C.text3}}>Conversion rate from</span>
        <div style={{minWidth:180}}><CustomSelect value={fromStep} onChange={v=>{const n=parseInt(v);setFromStep(n);if(toStep<=n)setToStep(Math.min(n+1,steps.length));}} options={stepOptions.slice(0,steps.length-1)}/></div>
        <span style={{fontSize:12,fontWeight:600,color:C.text3}}>to</span>
        <div style={{minWidth:180}}><CustomSelect value={toStep} onChange={v=>setToStep(parseInt(v))} options={stepOptions.filter(o=>o.value>fromStep)}/></div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:10,paddingLeft:PL}}>
        {lineSeriesMap.map(row=>(
          <div key={row.key} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:20,height:2.5,borderRadius:2,background:row.color}}/>
            <span style={{fontSize:11,color:C.text3}}>{lang==="zh"?(row.labelZh||row.label):row.label}</span>
          </div>
        ))}
      </div>
      <div style={{overflowX:"auto",position:"relative"}}>
        <svg ref={svgRef} width={W} height={H} style={{display:"block",cursor:"crosshair"}}
          onMouseMove={handleMouseMove} onMouseLeave={()=>setTooltip(null)}>
          {yTicks.map(y=>(
            <g key={y}>
              <line x1={PL} x2={W-PR} y1={yScale(y)} y2={yScale(y)} stroke={C.border} strokeDasharray="3 3"/>
              <text x={PL-6} y={yScale(y)+4} textAnchor="end" fontSize={10} fill={C.muted}>{y}%</text>
            </g>
          ))}
          {trendData.map((d,i)=>{
            if(i%every!==0&&i!==trendData.length-1)return null;
            return <text key={i} x={xScale(i)} y={H-8} textAnchor="middle" fontSize={10} fill={C.muted}>{d.label}</text>;
          })}
          {lineSeriesMap.map(row=>{
            const pts=row.points.map((v,i)=>xScale(i)+","+yScale(v)).join(" ");
            return (
              <g key={row.key}>
                <polyline points={pts} fill="none" stroke={row.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={0.9}/>
                {row.points.map((v,i)=>{
                  const hovered=tooltip&&tooltip.idx===i;
                  return <circle key={i} cx={xScale(i)} cy={yScale(v)} r={hovered?5:2.5} fill={row.color} stroke="#fff" strokeWidth={1.5}/>;
                })}
              </g>
            );
          })}
          {tooltip&&<line x1={tooltip.x} x2={tooltip.x} y1={PT} y2={H-PB} stroke={C.border2} strokeDasharray="4 3" strokeWidth={1}/>}
        </svg>
        {tooltip&&(
          <div style={{position:"absolute",
            top:Math.max(0,tooltip.relY-8),
            left:tooltip.relX+20+200>W ? tooltip.relX-220 : tooltip.relX+16,
            zIndex:9999,pointerEvents:"none",
            background:C.card,borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.14)",border:`1px solid ${C.border}`,padding:"10px 13px",minWidth:180}}>
            <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:7,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>
              {tooltip.label} · {pairKey}
            </div>
            {lineSeriesMap.map(row=>(
              <div key={row.key} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:8,height:8,borderRadius:2,background:row.color,flexShrink:0}}/>
                <span style={{fontSize:11,color:C.text3,flex:1}}>{lang==="zh"?(row.labelZh||row.label):row.label}</span>
                <span style={{fontSize:12,fontWeight:700,color:row.color}}>{row.points[tooltip.idx]!=null?row.points[tooltip.idx].toFixed(1):"-"}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
const InfoIcon=()=>(
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0,opacity:0.55}}>
    <circle cx="6.5" cy="6.5" r="5.75" stroke="#9ca3af" strokeWidth="1.25"/>
    <rect x="6" y="5.5" width="1" height="4" rx="0.5" fill="#9ca3af"/>
    <rect x="6" y="3.5" width="1" height="1.2" rx="0.5" fill="#9ca3af"/>
  </svg>
);
 
function InlineCorrelatedEvents({lang,t,result,steps,onOpenModal}){
  const [loaded,setLoaded]=useState(false);
  const [showSuccess,setShowSuccess]=useState(true);
  const [showDropoff,setShowDropoff]=useState(true);
  const [page,setPage]=useState(1);
  const [excludedEvents,setExcludedEvents]=useState([]);
  const [openMenuId,setOpenMenuId]=useState(null);
  const menuRef=useRef();
  const PER_PAGE=10;
 
  useEffect(function(){
    if(!openMenuId)return;
    const h=function(e){if(menuRef.current&&!menuRef.current.contains(e.target))setOpenMenuId(null);};
    document.addEventListener("mousedown",h);
    return function(){document.removeEventListener("mousedown",h);};
  },[openMenuId]);
 
  const totalUsers=result[0]?result[0].val:1;
  const convertedUsers=result[result.length-1]?result[result.length-1].val:0;
  const TAG_LIFT_SEED={Registration:1.8,Nodes:2.1,Referral:2.6,Monetisation:3.8,Tasks:2.4,"Image Generation":1.5,Support:1.3};
  const rawConvRate=convertedUsers/totalUsers;
  const MAX_LIFT_SEED=4.0;
  const baseRate=Math.min(rawConvRate, 1/MAX_LIFT_SEED - 0.01);
 
  const allRows=useMemo(function(){
    return ALL_EVENTS.map(function(ev){
      const seed=TAG_LIFT_SEED[ev.tag]||1.5;
      const idHash=ev.id.split("").reduce(function(h,c){return h*31+c.charCodeAt(0);},0);
      const variance=((Math.abs(idHash)%40)-20)/100;
      const lift=Math.max(1.0,parseFloat((seed+variance).toFixed(1)));
      const evUsers=Math.round((BASE_COUNTS[ev.id]||3000)*(totalUsers/21200));
      const evConvRate=Math.min(0.98, lift*baseRate);
      const completed=Math.round(evUsers*evConvRate);
      const droppedOff=evUsers-completed;
      const isSuccess=lift>=2;
      return{id:ev.id,label:lang==="zh"?ev.labelZh:ev.label,tag:ev.tag,lift,evUsers,completed,droppedOff,isSuccess};
    })
    .filter(function(ev){return !steps.includes(ev.id);})
    .filter(function(ev){return((ev.isSuccess&&showSuccess)||(!ev.isSuccess&&showDropoff));})
    .filter(function(ev){return !excludedEvents.includes(ev.id);})
    .sort(function(a,b){return b.lift-a.lift;});
  },[totalUsers,convertedUsers,baseRate,showSuccess,showDropoff,lang,steps,excludedEvents]);
 
  const totalPages=Math.ceil(allRows.length/PER_PAGE);
  const paginated=allRows.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const liftColor=function(lift){return lift>=4?C.success:lift>=2?"#0f766e":C.warn;};
 
  const CheckBox=function({checked,onChange,color}){return(
    <div onClick={onChange} style={{width:15,height:15,borderRadius:3,background:checked?color:"#fff",border:`1.5px solid ${checked?color:C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
      {checked&&<span style={{color:"#fff",fontSize:8,fontWeight:900,lineHeight:1}}>✓</span>}
    </div>
  );};
 
  return(
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:10}}>
        <span style={{fontSize:11,fontWeight:700,color:C.text,textTransform:"uppercase",letterSpacing:"0.07em"}}>Correlated Events</span>
        {loaded&&(
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:600,color:C.muted}}>Correlation</div>
            <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
              <CheckBox checked={showSuccess} onChange={()=>{setShowSuccess(v=>!v);setPage(1);}} color={C.success}/>
              <span style={{fontSize:11,fontWeight:showSuccess?600:400,color:showSuccess?C.success:C.muted}}>Success</span>
            </label>
            <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
              <CheckBox checked={showDropoff} onChange={()=>{setShowDropoff(v=>!v);setPage(1);}} color={C.warn}/>
              <span style={{fontSize:11,fontWeight:showDropoff?600:400,color:showDropoff?C.warn:C.muted}}>Drop-off</span>
            </label>
          </div>
        )}
      </div>
      {!loaded&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px",padding:"8px 18px",background:"#f9fafb",borderBottom:`1px solid ${C.border2}`}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Event</div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>Completed <InfoIcon/></div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>Dropped Off <InfoIcon/></div>
          </div>
          <div style={{padding:"28px 20px 24px",textAlign:"center",background:C.card}}>
            <div style={{fontSize:12,color:C.text3,lineHeight:1.7,maxWidth:460,margin:"0 auto 16px"}}>
              Highlight events which are likely to have affected the conversion rate within the funnel. Events already in your funnel steps are excluded.
            </div>
            <button onClick={()=>setLoaded(true)}
              style={{padding:"7px 22px",borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,color:C.text,fontSize:12,fontWeight:500,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg}
              onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              Load results
            </button>
          </div>
        </>
      )}
      {loaded&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 40px",padding:"8px 18px",background:"#f9fafb",borderBottom:`1px solid ${C.border2}`}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted}}>Event</div>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>Completed <InfoIcon/></div>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>Dropped Off <InfoIcon/></div>
            <div/>
          </div>
          {excludedEvents.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 18px",background:"#fffbeb",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.warn}}>{excludedEvents.length} event{excludedEvents.length>1?"s":""} excluded</span>
              <button onClick={()=>setExcludedEvents([])} style={{fontSize:11,color:C.accent,background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Restore all</button>
            </div>
          )}
          {paginated.length===0&&<div style={{padding:"32px",textAlign:"center",color:C.muted,fontSize:12}}>{t.noEventsMatch}</div>}
          {paginated.map(function(ev,i){
            const isLast=i===paginated.length-1;
            const lc=liftColor(ev.lift);
            const tagColor=TAG_COLORS[ev.tag]||C.muted;
            const isMenuOpen=openMenuId===ev.id;
            return(
              <div key={ev.id}
                style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 40px",padding:"13px 18px",borderBottom:isLast&&!excludedEvents.length?"none":`1px solid ${C.border}`,alignItems:"center",transition:"background 0.1s",position:"relative"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0f6ff"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div onClick={()=>onOpenModal(ev)} style={{cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontSize:12,color:lc}}>↗</span>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{ev.label}</span>
                    <span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:tagColor+"15",color:tagColor,fontWeight:600,marginLeft:2}}>{ev.tag}</span>
                  </div>
                  <div style={{fontSize:12,color:C.text3}}>
                    Persons who converted were{" "}
                    <strong style={{color:lc,fontWeight:600}}>{ev.lift}x {ev.isSuccess?"more":"less"} likely</strong>
                    {" "}to do this event
                  </div>
                </div>
                <div style={{textAlign:"center",cursor:"pointer"}} onClick={()=>onOpenModal(ev)}>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>{ev.completed.toLocaleString()}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>onOpenModal(ev)}>
                  <span style={{fontSize:12,color:C.text3}}>{ev.droppedOff.toLocaleString()}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}} ref={isMenuOpen?menuRef:null}>
                  <button
                    onClick={e=>{e.stopPropagation();setOpenMenuId(isMenuOpen?null:ev.id);}}
                    style={{width:26,height:26,borderRadius:5,border:`1px solid ${isMenuOpen?C.border2:"transparent"}`,background:isMenuOpen?C.bg:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.muted,letterSpacing:"1px",lineHeight:1}}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.bg;e.currentTarget.style.borderColor=C.border2;}}
                    onMouseLeave={e=>{if(!isMenuOpen){e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";}}}>
                    •••
                  </button>
                  {isMenuOpen&&(
                    <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,zIndex:500,background:C.card,border:`1px solid ${C.border2}`,borderRadius:7,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",minWidth:200,overflow:"hidden"}}>
                      <button
                        onClick={e=>{e.stopPropagation();setExcludedEvents(function(prev){return [...prev,ev.id];});setOpenMenuId(null);setPage(1);}}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 13px",border:"none",background:"transparent",cursor:"pointer",textAlign:"left",fontSize:12,color:C.text}}
                        onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{flexShrink:0}}>
                          <circle cx="6.5" cy="6.5" r="5.75" stroke={C.danger} strokeWidth="1.25"/>
                          <line x1="4" y1="6.5" x2="9" y2="6.5" stroke={C.danger} strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>Exclude from project</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{padding:"10px 18px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,background:"#fafafa"}}>
            <span style={{fontSize:11,color:C.muted}}>
              {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,allRows.length)} of {allRows.length} entries
            </span>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{width:26,height:26,borderRadius:5,border:`1px solid ${C.border}`,background:C.card,cursor:page===1?"not-allowed":"pointer",opacity:page===1?0.4:1,fontSize:13,color:C.text3,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages||totalPages===0}
              style={{width:26,height:26,borderRadius:5,border:`1px solid ${C.border}`,background:C.card,cursor:(page===totalPages||totalPages===0)?"not-allowed":"pointer",opacity:(page===totalPages||totalPages===0)?0.4:1,fontSize:13,color:C.text3,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          </div>
        </>
      )}
    </Card>
  );
}

const PROP_ENUM_VALUES={
  traffic_tag:["Organic","Paid Search","Social","Referral","Direct","Email"],
  activity_tag:["Active","Inactive","At Risk","Churned","New"],
  payment_duration_tag:["Monthly","Quarterly","Annual","Lifetime"],
  account_tenure_tag:["< 7 days","7–30 days","1–3 months","3–12 months","> 1 year"],
  device_type:["Android","MacOS","iOS","Linux","Windows"],
  user_role:["Free","Base","VIP","SVIP"],
  provinces:["Anhui","Fujian","Gansu","Guangdong","Guizhou","Hainan","Hebei","Heilongjiang","Henan","Hubei","Hunan","Jiangsu","Jiangxi","Jilin","Liaoning","Qinghai","Shaanxi","Shandong","Shanxi","Sichuan","Yunnan","Zhejiang","Taiwan"],
  acquisition_source:["Organic","Referral","Agent"],
  user_type:["Agent","Customer"],
};

function InlineCorrelatedProperties({result,steps,lang,t,onOpenModal,setTab,setFocusPropKey}){
  const [loaded,setLoaded]=useState(false);
  const [selectedProps,setSelectedProps]=useState([]);
  const [showSuccess,setShowSuccess]=useState(true);
  const [showDropoff,setShowDropoff]=useState(true);
  const [dropdownOpen,setDropdownOpen]=useState(false);
  const [page,setPage]=useState(1);
  const [propSearch,setPropSearch]=useState("");
  const [openMenuId,setOpenMenuId]=useState(null);
  const [excludedRows,setExcludedRows]=useState([]);
  const [hoveredProp,setHoveredProp]=useState(null);
  const hoverTimer=useRef(null);
  const PER_PAGE=10;
  const MAX_SHOW=20;
  const dropdownRef=useRef();
  const menuRef=useRef();

  useEffect(()=>{
    if(!dropdownOpen)return;
    const h=e=>{if(dropdownRef.current&&!dropdownRef.current.contains(e.target))setDropdownOpen(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[dropdownOpen]);

  useEffect(()=>{
    if(!openMenuId)return;
    const h=e=>{if(menuRef.current&&!menuRef.current.contains(e.target))setOpenMenuId(null);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[openMenuId]);

  const totalUsers=result[0]?result[0].val:1;
  const convertedUsers=result[result.length-1]?result[result.length-1].val:0;
  const convRate=convertedUsers/totalUsers;
  const baseRate=Math.min(convRate,0.24);

  const filteredPropList=ALL_PROPERTIES.filter(p=>
    propSearch===""||p.label.toLowerCase().includes(propSearch.toLowerCase())||p.key.toLowerCase().includes(propSearch.toLowerCase())
  );

  const toggleProp=function(key){setSelectedProps(function(prev){const next=prev.includes(key)?prev.filter(k=>k!==key):[...prev,key];if(next.length>0)setLoaded(true);return next;});setPage(1);};
  const selectAll=function(){setSelectedProps(ALL_PROPERTIES.map(p=>p.key));setLoaded(true);setDropdownOpen(false);setPage(1);};

  const allRows=useMemo(function(){
    if(!loaded||selectedProps.length===0)return[];
    const rows=[];
    ALL_PROPERTIES.filter(p=>selectedProps.includes(p.key)).forEach(function(prop){
      const values=PROP_ENUM_VALUES[prop.key]||[prop.label];
      values.forEach(function(val,vi){
        const hashStr=prop.key+"::"+val;
        const hash=hashStr.split("").reduce(function(h,c){return h*31+c.charCodeAt(0);},0);
        const seed=prop.type==="Array"?2.6:prop.type==="Numeric"?2.9:1.9;
        const variance=((Math.abs(hash)%80)-40)/100;
        const rawLift=seed+variance;
        const isNeg=rawLift<1.5&&vi%3===0;
        const lift=isNeg?Math.max(0.3,parseFloat((rawLift*0.5).toFixed(1))):Math.max(1.0,parseFloat(rawLift.toFixed(1)));
        const isPositive=lift>=2;
        const evConvRate=isNeg?Math.max(0.01,baseRate*lift):Math.min(0.98,lift*baseRate);
        const evUsers=Math.max(10,Math.round(totalUsers*(0.05+Math.abs(hash)%30/100)));
        const completed=Math.min(evUsers,Math.round(evUsers*evConvRate));
        const droppedOff=evUsers-completed;
        rows.push({rowKey:hashStr,propKey:prop.key,propLabel:prop.label,value:val,displayLabel:`${prop.label}::${val}`,type:prop.type,lift,isPositive,completed,droppedOff});
      });
    });
    return rows
      .filter(function(r){return !excludedRows.includes(r.rowKey)&&((r.isPositive&&showSuccess)||(!r.isPositive&&showDropoff));})
      .sort(function(a,b){return b.lift-a.lift;})
      .slice(0,MAX_SHOW);
  },[loaded,selectedProps,showSuccess,showDropoff,totalUsers,baseRate,excludedRows]);

  const totalPages=Math.ceil(allRows.length/PER_PAGE);
  const paginated=allRows.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const liftColor=function(lift,isPos){return isPos?(lift>=4?C.success:"#0f766e"):C.danger;};

  const CheckBox=function({checked,onChange,color}){return(
    <div onClick={onChange} style={{width:15,height:15,borderRadius:3,background:checked?color:"#fff",border:`1.5px solid ${checked?color:C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
      {checked&&<span style={{color:"#fff",fontSize:8,fontWeight:900,lineHeight:1}}>✓</span>}
    </div>
  );};

  const propButtonLabel=selectedProps.length===0?"0 properties selected":selectedProps.length===ALL_PROPERTIES.length?"All properties selected":`${selectedProps.length} propert${selectedProps.length===1?"y":"ies"} selected`;

  const openPropTip=function(prop){if(hoverTimer.current)clearTimeout(hoverTimer.current);setHoveredProp(prop);};
  const closePropTip=function(){hoverTimer.current=setTimeout(function(){setHoveredProp(null);},150);};

  const PropHoverCard=function(){
    if(!hoveredProp)return null;
    const typeColor=PROP_TYPE_COLORS[hoveredProp.type]||C.muted;
    return(
      <div onMouseEnter={()=>{if(hoverTimer.current)clearTimeout(hoverTimer.current);}} onMouseLeave={closePropTip}
        style={{position:"absolute",bottom:0,right:"292px",zIndex:9999,width:260,background:C.card,borderRadius:10,boxShadow:"0 8px 30px rgba(0,0,0,0.16)",border:`1px solid ${C.border}`,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderBottom:`1px solid ${C.border}`,background:"#f9fafb"}}>
          <span style={{fontSize:9,fontWeight:700,color:typeColor,textTransform:"uppercase",letterSpacing:"0.07em",padding:"2px 7px",borderRadius:3,background:typeColor+"15"}}>{hoveredProp.type}</span>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>{setFocusPropKey(hoveredProp.key);setTab("properties");setDropdownOpen(false);setHoveredProp(null);}} style={{fontSize:11,color:C.accent,background:"none",border:`1px solid ${C.accentLight}`,borderRadius:4,cursor:"pointer",fontWeight:600,padding:"3px 9px"}}>Edit</button>
            <button onClick={()=>{setFocusPropKey(hoveredProp.key);setTab("properties");setDropdownOpen(false);setHoveredProp(null);}} style={{fontSize:11,color:C.accent,background:"none",border:`1px solid ${C.accentLight}`,borderRadius:4,cursor:"pointer",fontWeight:600,padding:"3px 9px",display:"flex",alignItems:"center",gap:3}}>View <span style={{fontSize:10}}>↗</span></button>
          </div>
        </div>
        <div style={{padding:"11px 13px 13px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
            <div style={{width:8,height:8,borderRadius:2,background:typeColor,flexShrink:0}}/>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>{hoveredProp.label}</span>
          </div>
          <div style={{fontSize:10,fontFamily:"monospace",color:C.muted,marginBottom:8,paddingLeft:15}}>{hoveredProp.key}</div>
          <div style={{fontSize:11,color:C.text3,lineHeight:1.6}}>{hoveredProp.desc||"No description available."}</div>
          <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`,display:"flex",gap:14}}>
            <div>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Type</div>
              <span style={{fontSize:11,padding:"1px 7px",borderRadius:3,background:typeColor+"15",color:typeColor,fontWeight:600}}>{hoveredProp.type}</span>
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Sent as</div>
              <span style={{fontSize:11,fontFamily:"monospace",color:C.text}}>{hoveredProp.key}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return(
    <Card style={{padding:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:10}}>
        <span style={{fontSize:11,fontWeight:700,color:C.text,textTransform:"uppercase",letterSpacing:"0.07em"}}>Correlated Properties</span>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,fontWeight:600,color:C.muted}}>Properties</span>
            <div style={{position:"relative"}} ref={dropdownRef}>
              <PropHoverCard/>
              <button onClick={()=>{setDropdownOpen(v=>!v);setHoveredProp(null);setPropSearch("");}}
                style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:5,border:`1px solid ${dropdownOpen?C.accent:C.border2}`,background:dropdownOpen?C.accentBg:C.card,cursor:"pointer",fontSize:11,color:selectedProps.length>0?C.accent:C.muted,boxShadow:dropdownOpen?`0 0 0 2px ${C.accentLight}`:"none"}}>
                {propButtonLabel}
                <span style={{fontSize:9,color:C.muted,display:"inline-block",transform:dropdownOpen?"rotate(180deg)":"none",transition:"transform 0.15s"}}>▲</span>
              </button>
              {dropdownOpen&&(
                <div style={{position:"absolute",bottom:"calc(100% + 4px)",right:0,zIndex:600,width:280,borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.13)",border:`1px solid ${C.border2}`,overflow:"hidden",background:C.card}}>
                  <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`}}>
                    <input autoFocus value={propSearch} onChange={e=>setPropSearch(e.target.value)}
                      placeholder="Search person properties"
                      style={{width:"100%",padding:"6px 9px",borderRadius:6,border:`1px solid ${C.border2}`,fontSize:11,color:C.text,outline:"none",boxSizing:"border-box",background:"#f9fafb"}}/>
                  </div>
                  <div style={{maxHeight:260,overflowY:"auto"}}>
                    {filteredPropList.length===0&&<div style={{padding:"16px",textAlign:"center",fontSize:11,color:C.muted}}>No properties found</div>}
                    {filteredPropList.map(function(prop){
                      const sel=selectedProps.includes(prop.key);
                      return(
                        <div key={prop.key} onClick={()=>toggleProp(prop.key)}
                          onMouseEnter={()=>openPropTip(prop)}
                          onMouseLeave={closePropTip}
                          style={{display:"flex",alignItems:"center",gap:9,padding:"9px 14px",cursor:"pointer",background:sel?"#f0f6ff":"transparent",borderLeft:`3px solid ${sel?C.accent:"transparent"}`}}
                          onMouseOver={e=>!sel&&(e.currentTarget.style.background="#f9fafb")}
                          onMouseOut={e=>!sel&&(e.currentTarget.style.background="transparent")}>
                          <span style={{fontSize:12,flex:1,color:sel?C.accent:C.text,fontWeight:sel?600:400}}>{prop.label}</span>
                          {sel&&<span style={{fontSize:10,color:C.accent}}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{borderTop:`1px solid ${C.border}`,padding:"8px 12px",display:"flex",flexDirection:"column",gap:5,background:"#fafafa"}}>
                    <button onClick={selectAll}
                      style={{width:"100%",padding:"7px",borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,fontSize:11,fontWeight:500,color:C.text,cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.accentBg}
                      onMouseLeave={e=>e.currentTarget.style.background=C.card}>
                      Select all properties
                    </button>
                    {selectedProps.length>0&&(
                      <button onClick={()=>{setSelectedProps([]);setLoaded(false);setDropdownOpen(false);setPage(1);}}
                        style={{width:"100%",padding:"6px",borderRadius:5,border:`1px solid ${C.border}`,background:"transparent",fontSize:11,color:C.danger,cursor:"pointer"}}>
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{fontSize:11,fontWeight:600,color:C.muted}}>Correlation</div>
          <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
            <CheckBox checked={showSuccess} onChange={()=>{setShowSuccess(v=>!v);setPage(1);}} color={C.success}/>
            <span style={{fontSize:11,fontWeight:showSuccess?600:400,color:showSuccess?C.success:C.muted}}>Success</span>
          </label>
          <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
            <CheckBox checked={showDropoff} onChange={()=>{setShowDropoff(v=>!v);setPage(1);}} color={C.warn}/>
            <span style={{fontSize:11,fontWeight:showDropoff?600:400,color:showDropoff?C.warn:C.muted}}>Drop-off</span>
          </label>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 40px",padding:"8px 18px",background:"#f9fafb",borderBottom:`1px solid ${C.border2}`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Person Property</div>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>Completed <InfoIcon/></div>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>Dropped Off <InfoIcon/></div>
        <div/>
      </div>

      {selectedProps.length===0&&(
        <div style={{padding:"28px 20px 24px",textAlign:"center",background:C.card}}>
          <div style={{fontSize:12,color:C.text3,lineHeight:1.7,maxWidth:460,margin:"0 auto 16px"}}>
            Highlight properties which are likely to have affected the conversion rate within the funnel.
          </div>
          <button onClick={()=>setDropdownOpen(true)}
            style={{padding:"7px 22px",borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,color:C.text,fontSize:12,fontWeight:500,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
            Select properties
          </button>
        </div>
      )}

      {selectedProps.length>0&&loaded&&(
        <>
          {excludedRows.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 18px",background:"#fffbeb",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.warn}}>{excludedRows.length} row{excludedRows.length>1?"s":""} excluded</span>
              <button onClick={()=>setExcludedRows([])} style={{fontSize:11,color:C.accent,background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Restore all</button>
            </div>
          )}
          {paginated.length===0&&<div style={{padding:"32px",textAlign:"center",color:C.muted,fontSize:12}}>No results match current filters.</div>}
          {paginated.map(function(row,i){
            const isLast=i===paginated.length-1;
            const lc=liftColor(row.lift,row.isPositive);
            const isMenuOpen=openMenuId===row.rowKey;
            return(
              <div key={row.rowKey}
                style={{display:"grid",gridTemplateColumns:"1fr 110px 110px 40px",padding:"13px 18px",borderBottom:isLast&&totalPages<=1?"none":`1px solid ${C.border}`,alignItems:"center",cursor:"pointer",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0f6ff"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div onClick={()=>onOpenModal(row)}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontSize:12,color:lc}}>{row.isPositive?"↗":"↘"}</span>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{row.displayLabel}</span>
                  </div>
                  <div style={{fontSize:12,color:C.text3}}>
                    Persons who converted were{" "}
                    <strong style={{color:lc,fontWeight:600}}>{row.lift}x {row.isPositive?"more":"less"} likely</strong>
                    {" "}to have this property value
                  </div>
                </div>
                <div style={{textAlign:"center"}} onClick={()=>onOpenModal(row)}>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>{row.completed.toLocaleString()}</span>
                </div>
                <div style={{textAlign:"center"}} onClick={()=>onOpenModal(row)}>
                  <span style={{fontSize:12,color:C.text3}}>{row.droppedOff.toLocaleString()}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}} ref={isMenuOpen?menuRef:null}>
                  <button
                    onClick={e=>{e.stopPropagation();setOpenMenuId(isMenuOpen?null:row.rowKey);}}
                    style={{width:26,height:26,borderRadius:5,border:`1px solid ${isMenuOpen?C.border2:"transparent"}`,background:isMenuOpen?C.bg:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.muted,letterSpacing:"1px",lineHeight:1}}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.bg;e.currentTarget.style.borderColor=C.border2;}}
                    onMouseLeave={e=>{if(!isMenuOpen){e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";}}}>
                    •••
                  </button>
                  {isMenuOpen&&(
                    <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,zIndex:500,background:C.card,border:`1px solid ${C.border2}`,borderRadius:7,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",minWidth:200,overflow:"hidden"}}>
                      <button
                        onClick={e=>{e.stopPropagation();setExcludedRows(function(prev){return [...prev,row.rowKey];});setOpenMenuId(null);setPage(1);}}
                        style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 13px",border:"none",background:"transparent",cursor:"pointer",textAlign:"left",fontSize:12,color:C.text}}
                        onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span>Exclude from project</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {allRows.length>0&&(
            <div style={{padding:"10px 18px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,background:"#fafafa"}}>
              <span style={{fontSize:11,color:C.muted}}>
                {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,allRows.length)} of {allRows.length} entries
              </span>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{width:26,height:26,borderRadius:5,border:`1px solid ${C.border}`,background:C.card,cursor:page===1?"not-allowed":"pointer",opacity:page===1?0.4:1,fontSize:13,color:C.text3,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages||totalPages===0}
                style={{width:26,height:26,borderRadius:5,border:`1px solid ${C.border}`,background:C.card,cursor:(page===totalPages||totalPages===0)?"not-allowed":"pointer",opacity:(page===totalPages||totalPages===0)?0.4:1,fontSize:13,color:C.text3,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function CorrModalPortal({ev,onClose,lang,result}){
  const liftColor=function(lift){return lift>=4?C.success:lift>=2?"#0f766e":C.warn;};
  const lc=liftColor(ev.lift);
  const lastStepLabel=result&&result.length>=1?(lang==="zh"?result[result.length-1].labelZh:result[result.length-1].label):"last step";
  const totalConverted=result?result[result.length-1].val:0;
  const totalUsers=result?result[0].val:1;
  const totalDropped=totalUsers-totalConverted;
  const yesSuccess=ev.completed;
  const yesDrop=ev.droppedOff;
  const noSuccess=Math.max(0,totalConverted-yesSuccess);
  const noDrop=Math.max(0,totalDropped-yesDrop);
  const totSuccess=yesSuccess+noSuccess;
  const totDrop=yesDrop+noDrop;
  const colSucYesPct=totSuccess>0?(yesSuccess/totSuccess*100).toFixed(2):"0.00";
  const colDropYesPct=totDrop>0?(yesDrop/totDrop*100).toFixed(2):"0.00";
  const score=Math.min(0.999,(ev.lift-1)/(ev.lift+3)).toFixed(3);
  const isPositive=ev.lift>=2;
  return(
    <div style={{background:C.card,borderRadius:10,width:540,boxShadow:"0 12px 40px rgba(0,0,0,0.25)",border:`1px solid ${C.border}`,overflow:"hidden",maxHeight:"85vh",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontSize:14,fontWeight:600,color:C.text}}>Correlation details</span>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:5,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",fontSize:16,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
      </div>
      <div style={{padding:"18px 20px 20px"}}>
        <p style={{fontSize:12,color:C.text3,marginBottom:18,lineHeight:1.6}}>
          The table below displays the correlation details for users who performed event <strong style={{color:C.text}}>{ev.label}</strong> and completed <strong style={{color:C.text}}>{lastStepLabel}</strong>.
        </p>
        <div style={{border:`1px solid ${C.border2}`,borderRadius:8,overflow:"hidden",marginBottom:12}}>
          <div style={{background:"#f9fafb",padding:"8px 12px",textAlign:"center",borderBottom:`1px solid ${C.border2}`}}>
            <span style={{fontSize:11,fontWeight:600,color:C.muted}}>Results Matrix</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:"#f9fafb"}}>
                <th style={{padding:"8px 14px",textAlign:"left",fontWeight:600,color:C.muted,fontSize:11,borderBottom:`1px solid ${C.border2}`}}>Performed Event</th>
                <th style={{padding:"8px 14px",textAlign:"center",fontWeight:600,color:C.success,fontSize:11,borderBottom:`1px solid ${C.border2}`}}>
                  <div>Success</div><div style={{fontSize:10,fontWeight:400,color:C.muted,marginTop:2}}>Completed the funnel</div>
                </th>
                <th style={{padding:"8px 14px",textAlign:"center",fontWeight:600,color:C.warn,fontSize:11,borderBottom:`1px solid ${C.border2}`}}>
                  <div>Dropped Off</div><div style={{fontSize:10,fontWeight:400,color:C.muted,marginTop:2}}>Did not complete the funnel</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"12px 14px"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>YES</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>Performed the event</div></td>
                <td style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>{colSucYesPct}%</div><div style={{fontSize:11,color:C.success,marginTop:2}}>{yesSuccess.toLocaleString()} users</div></td>
                <td style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>{colDropYesPct}%</div><div style={{fontSize:11,color:C.warn,marginTop:2}}>{yesDrop.toLocaleString()} users</div></td>
              </tr>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"12px 14px"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>NO</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>Did not perform the event</div></td>
                <td style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>{(100-parseFloat(colSucYesPct)).toFixed(2)}%</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{noSuccess.toLocaleString()} users</div></td>
                <td style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>{(100-parseFloat(colDropYesPct)).toFixed(2)}%</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{noDrop.toLocaleString()} users</div></td>
              </tr>
              <tr style={{background:"#f9fafb"}}>
                <td style={{padding:"9px 14px",fontSize:11,color:C.muted,fontWeight:500}}>Total</td>
                <td style={{padding:"9px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:12}}>100%</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{totSuccess.toLocaleString()} users</div></td>
                <td style={{padding:"9px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:12}}>100%</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{totDrop.toLocaleString()} users</div></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{background:isPositive?C.successBg:C.dangerBg,border:`1px solid ${isPositive?"#bbf7d0":"#fecaca"}`,borderRadius:7,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <span style={{fontSize:13,color:isPositive?C.success:C.danger}}>{isPositive?"→":"←"}</span>
            <span style={{fontSize:12,fontWeight:600,color:isPositive?C.success:C.danger}}>{isPositive?"Positive":"Negative"} correlation</span>
            <span style={{fontSize:11,color:C.muted}}>·</span>
            <span style={{fontSize:12,fontWeight:700,color:C.warn}}>φ = {score}</span>
          </div>
          <div style={{fontSize:11,color:C.text3,lineHeight:1.65}}>
            {isPositive
              ?<>Users who completed the funnel were <strong style={{color:C.success}}>{ev.lift}× more likely</strong> to have performed <strong style={{color:C.text}}>{ev.label}</strong> than those who didn't. A score of <strong style={{color:C.warn}}>{score}</strong> indicates a <strong>{parseFloat(score)>=0.3?"strong":"moderate"}</strong> positive association.</>
              :<>Users who completed the funnel were <strong style={{color:C.danger}}>{ev.lift}× less likely</strong> to have performed <strong style={{color:C.text}}>{ev.label}</strong>. A score of <strong style={{color:C.warn}}>{score}</strong> suggests this event may be associated with drop-off.</>
            }
          </div>
          <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${isPositive?"#bbf7d0":"#fecaca"}`,fontSize:10,color:C.muted}}>
            φ scale: 0 = no correlation · 0.3+ = meaningful · 0.5+ = strong
          </div>
        </div>
      </div>
      <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end",background:"#fafafa"}}>
        <button onClick={onClose} style={{padding:"7px 20px",borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,fontSize:12,fontWeight:600,color:C.text3,cursor:"pointer"}}>Dismiss</button>
      </div>
    </div>
  );
}

function PropCorrModal({row,lastStepLabel,totalUsers,convertedUsers,onClose}){
  const liftColor=function(lift,isPos){return isPos?(lift>=4?C.success:"#0f766e"):C.danger;};
  const lc=liftColor(row.lift,row.isPositive);
  const totalDropped=totalUsers-convertedUsers;
  const noSuccess=Math.max(0,convertedUsers-row.completed);
  const noDrop=Math.max(0,totalDropped-row.droppedOff);
  const totSuccess=row.completed+noSuccess;
  const totDrop=row.droppedOff+noDrop;
  const colSucYesPct=totSuccess>0?(row.completed/totSuccess*100).toFixed(2):"0.00";
  const colDropYesPct=totDrop>0?(row.droppedOff/totDrop*100).toFixed(2):"0.00";
  const score=Math.min(0.999,Math.abs(row.lift-1)/(Math.abs(row.lift-1)+3)).toFixed(3);
  return(
    <div style={{background:C.card,borderRadius:10,width:520,boxShadow:"0 12px 40px rgba(0,0,0,0.25)",border:`1px solid ${C.border}`,overflow:"hidden",maxHeight:"85vh",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontSize:14,fontWeight:600,color:C.text}}>Correlation details</span>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:5,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",fontSize:16,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
      </div>
      <div style={{padding:"18px 20px 20px"}}>
        <p style={{fontSize:12,color:C.text3,marginBottom:18,lineHeight:1.6}}>
          Correlation details for property value <strong style={{color:C.text}}>{row.displayLabel}</strong> and completed <strong style={{color:C.text}}>{lastStepLabel}</strong>.
        </p>
        <div style={{border:`1px solid ${C.border2}`,borderRadius:8,overflow:"hidden",marginBottom:12}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:"#f9fafb"}}>
                <th style={{padding:"8px 14px",textAlign:"left",fontWeight:600,color:C.muted,fontSize:11,borderBottom:`1px solid ${C.border2}`}}>Has Property Value</th>
                <th style={{padding:"8px 14px",textAlign:"center",fontWeight:600,color:C.success,fontSize:11,borderBottom:`1px solid ${C.border2}`}}>Success</th>
                <th style={{padding:"8px 14px",textAlign:"center",fontWeight:600,color:C.warn,fontSize:11,borderBottom:`1px solid ${C.border2}`}}>Dropped Off</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"12px 14px"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>YES</div></td>
                <td style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>{colSucYesPct}%</div><div style={{fontSize:11,color:C.success,marginTop:2}}>{row.completed.toLocaleString()} users</div></td>
                <td style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>{colDropYesPct}%</div><div style={{fontSize:11,color:C.warn,marginTop:2}}>{row.droppedOff.toLocaleString()} users</div></td>
              </tr>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"12px 14px"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>NO</div></td>
                <td style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>{(100-parseFloat(colSucYesPct)).toFixed(2)}%</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{noSuccess.toLocaleString()} users</div></td>
                <td style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:13}}>{(100-parseFloat(colDropYesPct)).toFixed(2)}%</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{noDrop.toLocaleString()} users</div></td>
              </tr>
              <tr style={{background:"#f9fafb"}}>
                <td style={{padding:"9px 14px",fontSize:11,color:C.muted}}>Total</td>
                <td style={{padding:"9px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:12}}>100%</div><div style={{fontSize:10,color:C.muted}}>{totSuccess.toLocaleString()} users</div></td>
                <td style={{padding:"9px 14px",textAlign:"center"}}><div style={{fontWeight:600,color:C.text,fontSize:12}}>100%</div><div style={{fontSize:10,color:C.muted}}>{totDrop.toLocaleString()} users</div></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{background:row.isPositive?C.successBg:C.dangerBg,border:`1px solid ${row.isPositive?"#bbf7d0":"#fecaca"}`,borderRadius:7,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:600,color:lc}}>{row.isPositive?"Positive":"Negative"} correlation · φ = {score}</span>
          </div>
          <div style={{fontSize:11,color:C.text3,lineHeight:1.65}}>
            {row.isPositive
              ?<>Users who completed the funnel were <strong style={{color:C.success}}>{row.lift}× more likely</strong> to have <strong style={{color:C.text}}>{row.displayLabel}</strong>.</>
              :<>Users who completed the funnel were <strong style={{color:C.danger}}>{row.lift}× less likely</strong> to have <strong style={{color:C.text}}>{row.displayLabel}</strong>.</>
            }
          </div>
        </div>
      </div>
      <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end",background:"#fafafa"}}>
        <button onClick={onClose} style={{padding:"7px 20px",borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,fontSize:12,fontWeight:600,color:C.text3,cursor:"pointer"}}>Dismiss</button>
      </div>
    </div>
  );
}

function FunnelPage({panelOpen,setPanel,setTab,descriptions,setDescriptions,setFocusPropKey,setGlobalCorrEv,setGlobalPropRow,setGlobalPropMeta}){
  const t=useT();const lang=useLang();
  const {days:periodDays,startDate:periodStart,endDate:periodEnd}=useDateRange();
  const [recalcKey,setRecalcKey]=useState(0);
  const [recalcAnim,setRecalcAnim]=useState(false);
  const prevPeriodDays=useRef(periodDays);
  useEffect(()=>{
    if(prevPeriodDays.current===periodDays)return;
    prevPeriodDays.current=periodDays;
    setRecalcAnim(true);
    setRan(false);
    const timer=setTimeout(()=>{setRan(true);setRecalcKey(k=>k+1);setRecalcAnim(false);},700);
    return()=>clearTimeout(timer);
  },[periodDays]);
  const [steps,setSteps]=useState(BUILT_IN_PRESETS.registration.steps);
  const [activePreset,setActivePreset]=useState("registration");
  const [ran,setRan]=useState(true);
  const [graphType,setGraphType]=useState("funnel");
  const [groupBy,setGroupBy]=useState("day");
  const [fromStep,setFromStep]=useState(1);
  const [toStep,setToStep]=useState(2);
  const [breakBy,setBreakBy]=useState("device");
  const [aggregateBy,setAggregateBy]=useState("users");
  const [stepOrder,setStepOrder]=useState("sequential");
  const [convCalc,setConvCalc]=useState("overall");
  const [convWindowLimitNumber,setConvWindowLimitNumber]=useState(14);
  const [convWindowLimitUnit,setConvWindowLimitUnit]=useState("days");
  const [activeFilters,setActiveFilters]=useState([]);
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOverIdx,setDragOverIdx]=useState(null);
  const scrollRef=useRef(null);
  const openCorrModal=function(ev,result){setGlobalCorrEv({ev,result});};
  const openPropModal=function(row,result){
    const lastStep=result&&result.length>=1?result[result.length-1]:null;
    setGlobalPropRow(row);
    setGlobalPropMeta({
      lastStepLabel:lastStep?(lastStep.label||lastStep.labelZh||"last step"):"last step",
      totalUsers:result&&result[0]?result[0].val:1,
      convertedUsers:lastStep?lastStep.val:0,
    });
  };
  const [customPresets,setCustomPresets]=useState({});
  const [loadingPresets,setLoadingPresets]=useState(true);
  const [showSaveModal,setShowSaveModal]=useState(false);
  const [deleteConfirm,setDeleteConfirm]=useState(null);
  const [stepsCollapsed,setStepsCollapsed]=useState(false);
  const [expandedPreset,setExpandedPreset]=useState(null);
  const [refreshing,setRefreshing]=useState(false);
  const [tip,setTip]=useState(null);
  const [stepTip,setStepTip]=useState(null);
  const stepCloseTimer=useRef(null);
  const stepTipEditing=useRef(false);
  const [addStepTip,setAddStepTip]=useState(null);
  const addStepCloseTimer=useRef(null);
  const addStepTipEditing=useRef(false);

  const openAddStepTip=function(ev,rect){
    if(addStepCloseTimer.current)clearTimeout(addStepCloseTimer.current);
    const pw=260;const spaceRight=window.innerWidth-(rect.right+12);
    const left=spaceRight>=pw?rect.right+12:rect.left-pw-12;
    const top=Math.min(Math.max(8,rect.top),window.innerHeight-280);
    setAddStepTip({ev,left:Math.max(8,left),top});
  };
  const startCloseAddStepTip=function(){addStepCloseTimer.current=setTimeout(function(){if(!addStepTipEditing.current)setAddStepTip(null);},300);};
  const cancelCloseAddStepTip=function(){if(addStepCloseTimer.current)clearTimeout(addStepCloseTimer.current);};
  const openStepTip=function(ev,rect){
    if(stepCloseTimer.current)clearTimeout(stepCloseTimer.current);
    const pw=260;const spaceRight=window.innerWidth-(rect.right+10);
    const left=spaceRight>=pw?rect.right+10:rect.left-pw-10;
    const top=Math.min(rect.top,window.innerHeight-240);
    setStepTip({ev,left:Math.max(8,left),top});
  };
  const startCloseStepTip=function(){stepCloseTimer.current=setTimeout(function(){if(!stepTipEditing.current)setStepTip(null);},300);};
  const cancelCloseStepTip=function(){if(stepCloseTimer.current)clearTimeout(stepCloseTimer.current);};
  const handleRefresh=function(){setRefreshing(true);setRan(false);setTimeout(function(){setRan(true);setRefreshing(false);},800);};
  const autoRun=function(){setRefreshing(true);setRan(false);setTimeout(function(){setRan(true);setRefreshing(false);},600);};

  useEffect(function(){
    (async function(){
      try{const r=await localStorage.get(STORAGE_KEY);if(r&&r.value)setCustomPresets(JSON.parse(r.value));}catch(_){}
      setLoadingPresets(false);
    })();
  },[]);

  const coloredBreakItems=useMemo(function(){return [BASELINE,...(BREAK_DEFS[breakBy]||[])].map(function(item,i){return {...item,color:C.seg[i]||C.muted};});},[breakBy]);
  const segmentMult=useMemo(function(){
    if(!activeFilters.length)return 1;
    return activeFilters.reduce(function(acc,key){const seg=SEGMENTS.find(function(s){return s.key===key;});return acc*(seg?seg.mult:1);},1);
  },[activeFilters]);
  const toggleFilter=function(key){setActiveFilters(function(prev){return prev.includes(key)?prev.filter(function(k){return k!==key;}):[...prev,key];});autoRun();};
  const SESSION_MULT=1.45;
  const ORDER_MULT={sequential:1.0,strict:0.84,any:1.13};

  const breakdownData=useMemo(function(){
    if(!ran||steps.length<2)return [];
    const oMult=ORDER_MULT[stepOrder]||1.0;
    return coloredBreakItems.map(function(item){
      const curve=SEG_CURVES[item.key]||SEG_CURVES.all;
      const baseMult=aggregateBy==="sessions"?SESSION_MULT:1;
      const periodScale=periodDays/30;
      const base0=Math.round((BASE_COUNTS[steps[0]]||5000)*item.mult*segmentMult*baseMult*periodScale);
      const sd=steps.reduce(function(acc,id,i){
        let val;
        if(i===0){val=base0;}
        else{
          const curveVal=base0*curve[Math.min(i,curve.length-1)];
          val=Math.round(Math.min(curveVal*Math.pow(oMult,i),acc[i-1].val));
        }
        const ev=ALL_EVENTS.find(function(e){return e.id===id;});
        acc.push({id,label:ev?ev.label:id,labelZh:ev?ev.labelZh:id,val,avgTime:AVG_TIME[id]!=null?AVG_TIME[id]:null});
        return acc;
      },[]);
      const s1=sd[0]?sd[0].val:1;
      return {...item,stepData:sd,totalConvPct:sd[sd.length-1].val/s1*100};
    });
  },[ran,steps,coloredBreakItems,segmentMult,aggregateBy,stepOrder,periodDays]);

  const result=breakdownData[0]?breakdownData[0].stepData:[];

  const chartData=useMemo(function(){
    if(!breakdownData.length||!result.length)return [];
    const rows=breakBy==="none"?breakdownData:breakdownData.filter(function(r){return r.key!=="all";});
    return result.map(function(s,i){
      const name=lang==="zh"?s.labelZh:s.label;
      const obj={name:name.length>12?name.slice(0,11)+"…":name,fullName:name};
      rows.forEach(function(row){
        const s1=row.stepData[0]?row.stepData[0].val:1;
        const sPrev=row.stepData[i-1]?row.stepData[i-1].val:s1;
        const base=convCalc==="relative"?(i===0?s1:sPrev):s1;
        obj[row.key]=parseFloat((row.stepData[i]?row.stepData[i].val/base*100:0).toFixed(1));
        obj[row.key+"_raw"]=row.stepData[i]?row.stepData[i].val:0;
      });
      return obj;
    });
  },[breakdownData,breakBy,result,lang,convCalc]);

  const trendData=useMemo(function(){
    if(!ran||steps.length<2||!result.length)return [];
    void periodDays; void periodStart; void periodEnd;
    const points=groupBy==="day"
      ? Math.min(periodDays,90)
      : groupBy==="week"
      ? Math.max(1,Math.ceil(periodDays/7))
      : Math.max(1,Math.ceil(periodDays/30));
    const labels=Array.from({length:points},(_,i)=>{
      const d=new Date(periodStart);
      if(groupBy==="day"){d.setDate(d.getDate()+i);return(d.getMonth()+1)+"/"+d.getDate();}
      if(groupBy==="week"){d.setDate(d.getDate()+i*7);return"W"+Math.ceil(d.getDate()/7)+" "+d.toLocaleString("default",{month:"short"});}
      d.setMonth(d.getMonth()+i);return d.toLocaleString("default",{month:"short",year:"2-digit"});
    });
    const pairs=steps.slice(1).map(function(id,i){
      const base=result[i+1]?result[i+1].val/(result[0]?result[0].val:1)*100:50;
      return {label:"Step "+(i+1)+"→"+(i+2),base};
    });
    return labels.map(function(label,li){
      const obj={label};
      pairs.forEach(function(p){
        const noise=Math.sin(li*0.7+p.label.length)*4+Math.cos(li*1.1)*3;
        obj[p.label]=Math.max(1,Math.min(100,parseFloat((p.base+noise).toFixed(1))));
      });
      for(let f=1;f<steps.length;f++){
        for(let tt=f+1;tt<=steps.length;tt++){
          const key="Step "+f+"→"+tt;
          if(!obj[key]){
            const baseF=result[f-1]?result[f-1].val/(result[0]?result[0].val:1)*100:80;
            const baseT=result[tt-1]?result[tt-1].val/(result[0]?result[0].val:1)*100:40;
            const noise=Math.sin(li*0.9+f+tt)*3+Math.cos(li*1.3)*2;
            obj[key]=Math.max(1,Math.min(100,parseFloat((baseT/baseF*100+noise).toFixed(1))));
          }
        }
      }
      return obj;
    });
  },[ran,steps,result,groupBy,periodDays,periodStart,periodEnd]);

  const ChartTooltip=function(props){
    const {active,payload}=props;
    if(!active||!payload||!payload.length)return null;
    return (
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 13px",fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",minWidth:160}}>
        <div style={{fontWeight:700,color:C.text,marginBottom:7,borderBottom:`1px solid ${C.border}`,paddingBottom:5}}>{payload[0]&&payload[0].payload?payload[0].payload.fullName:""}</div>
        {payload.map(function(p){
          const raw=p.payload[p.dataKey+"_raw"];
          return (
            <div key={p.dataKey} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <div style={{width:8,height:8,borderRadius:2,background:p.fill,flexShrink:0}}/>
              <span style={{color:C.text3,flex:1}}>{p.name}</span>
              <span style={{fontWeight:700,color:C.text}}>{p.value}%</span>
              {raw!=null&&<span style={{color:C.muted,fontSize:10}}>({raw.toLocaleString()})</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const allPresets={...BUILT_IN_PRESETS,...customPresets};
  const evLabel=function(id){const ev=ALL_EVENTS.find(function(e){return e.id===id;});return lang==="zh"?(ev?ev.labelZh:id):(ev?ev.label:id);};
  const loadPreset=function(key){
    if(allPresets[key].steps&&allPresets[key].steps.length>0){
      setSteps(allPresets[key].steps);setActivePreset(key);autoRun();
    }
  };
  const addStep=function(id){setSteps(function(s){return [...s,id];});autoRun();};
  const removeStep=function(id,idx){setSteps(function(s){return s.filter(function(_,i){return i!==idx;});});autoRun();};
  const onDragStart=function(i){setDragIdx(i);};
  const onDragOver=function(e,i){e.preventDefault();setDragOverIdx(i);};
  const onDrop=function(i){
    if(dragIdx===null||dragIdx===i){setDragIdx(null);setDragOverIdx(null);return;}
    const arr=[...steps];const m=arr.splice(dragIdx,1)[0];arr.splice(i,0,m);
    setSteps(arr);autoRun();setDragIdx(null);setDragOverIdx(null);
  };
  const onDragEnd=function(){setDragIdx(null);setDragOverIdx(null);};
  const handleSavePreset=function(id,p){setCustomPresets(function(prev){return {...prev,[id]:p};});};
  const handleDeletePreset=async function(key){
    const u={...customPresets};delete u[key];setCustomPresets(u);
    try{await localStorage.set(STORAGE_KEY,JSON.stringify(u));}catch(_){}
    if(activePreset===key){setActivePreset("registration");setSteps(BUILT_IN_PRESETS.registration.steps);autoRun();}
    setDeleteConfirm(null);
  };
  const convColor=function(n){return n>=80?C.success:n>=50?C.accent:n>=30?C.warn:C.danger;};

  const aggOptions=[{value:"users",label:t.aggUsers,desc:"Count each user once"},{value:"sessions",label:t.aggSessions,desc:"Count each session separately"}];
  const stepOrderOptions=[{value:"sequential",label:t.orderSequential,desc:"In order; other events allowed between"},{value:"strict",label:t.orderStrict,desc:"Exact order, nothing in between"},{value:"any",label:t.orderAny,desc:"Events may occur in any order"}];
  const convCalcOptions=[{value:"overall",label:t.convOverall,desc:"Each step vs. step 1"},{value:"relative",label:t.convRelative,desc:"Each step vs. previous step"}];
  const convWindowNumberOptions=[{value:1,label:"1"},{value:3,label:"3"},{value:7,label:"7"},{value:14,label:"14"},{value:30,label:"30"},{value:60,label:"60"},{value:90,label:"90"}];
  const convWindowUnitOptions=[{value:"sessions",label:"Sessions"},{value:"days",label:"Days"},{value:"weeks",label:"Weeks"},{value:"months",label:"Months"}];
  const warnConvWindowLongSession = aggregateBy === "sessions" && (convWindowLimitUnit !== "sessions" || convWindowLimitNumber > 1);

  const CollapsedSummary=function(){return(
    <div style={{padding:"12px 16px",background:C.bg,borderRadius:7,border:`1px dashed ${C.border2}`,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
      {steps.map(function(id,i){
        const ev=ALL_EVENTS.find(function(e){return e.id===id;});
        const tagColor=TAG_COLORS[ev?ev.tag:""]||C.muted;
        return (
          <Fragment key={i}>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:5,background:tagColor+"12",border:`1px solid ${tagColor}30`}}>
              <div style={{width:16,height:16,borderRadius:3,background:tagColor,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:11,fontWeight:500,color:C.text2}}>{evLabel(id)}</span>
            </div>
            {i<steps.length-1&&<span style={{color:C.muted,fontSize:12,fontWeight:700}}>→</span>}
          </Fragment>
        );
      })}
    </div>
  );};

  return (
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      {addStepTip&&(
        <div onMouseEnter={cancelCloseAddStepTip} onMouseLeave={startCloseAddStepTip}
          style={{position:"fixed",top:addStepTip.top,left:addStepTip.left,zIndex:99999}}>
          <StepInfoPopover ev={addStepTip.ev} descriptions={descriptions} setDescriptions={setDescriptions}
            onClose={()=>setAddStepTip(null)} onView={()=>{setTab("events");setAddStepTip(null);}}
            onEditingChange={function(v){addStepTipEditing.current=v;}}/>
        </div>
      )}
      {stepTip&&(
        <div onMouseEnter={cancelCloseStepTip} onMouseLeave={startCloseStepTip}
          style={{position:"fixed",top:stepTip.top,left:stepTip.left,zIndex:99999}}>
          <StepInfoPopover ev={stepTip.ev} descriptions={descriptions} setDescriptions={setDescriptions}
            onClose={()=>setStepTip(null)} onView={()=>{setTab("events");setStepTip(null);}}
            onEditingChange={function(v){stepTipEditing.current=v;}}/>
        </div>
      )}
      {tip&&(
        <div style={{position:"fixed",top:tip.top,left:tip.left,transform:"translateY(-50%)",zIndex:99999,background:C.card,borderRadius:8,padding:"10px 13px",width:215,boxShadow:"0 6px 24px rgba(0,0,0,0.18)",border:`1px solid ${C.border}`,pointerEvents:"none"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:4}}>{lang==="zh"?tip.seg.labelZh:tip.seg.label}</div>
          <div style={{fontSize:10,color:C.text3,lineHeight:1.55,marginBottom:7}}>{lang==="zh"?tip.seg.descZh:tip.seg.desc}</div>
          <div style={{display:"flex",gap:14,borderTop:`1px solid ${C.border}`,paddingTop:7}}>
            <div><div style={{fontSize:9,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:2}}>USERS</div><div style={{fontSize:12,fontWeight:700,color:C.text}}>{tip.seg.users.toLocaleString()}</div></div>
            <div><div style={{fontSize:9,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:2}}>RULES</div><div style={{fontSize:12,fontWeight:700,color:C.text}}>{tip.seg.rules}</div></div>
          </div>
        </div>
      )}
      {showSaveModal&&<SavePresetModal steps={steps} onSave={handleSavePreset} onClose={()=>setShowSaveModal(false)}/>}
      {deleteConfirm&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.3)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:C.card,borderRadius:8,padding:"22px 26px",width:300,boxShadow:"0 8px 30px rgba(0,0,0,0.12)"}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:6}}>{t.deletePresetTitle}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:18}}>{t.deleteConfirmText(customPresets[deleteConfirm]?customPresets[deleteConfirm].label:"")}</div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn onClick={()=>setDeleteConfirm(null)}>{t.cancel}</Btn>
              <button onClick={()=>handleDeletePreset(deleteConfirm)} style={{padding:"6px 14px",borderRadius:6,border:"none",background:C.danger,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>{t.deleteBtn}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{width:panelOpen?"268px":"40px",flexShrink:0,borderRight:panelOpen?`1px solid ${C.border}`:"none",background:panelOpen?C.card:"transparent",overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column"}}>
        {panelOpen?(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,fontWeight:600,color:C.text}}>{t.filters}</span>
              <button onClick={()=>setPanel(false)} style={{width:28,height:28,borderRadius:5,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:C.text3}}>←</button>
            </div>
            <div style={{padding:"12px 12px",display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <FieldLabel>{t.aggregateBy}</FieldLabel>
                <CustomSelect value={aggregateBy} onChange={function(v){
                    setAggregateBy(v);
                    if(v==="sessions"){ setConvWindowLimitNumber(1); setConvWindowLimitUnit("sessions"); }
                    autoRun();
                }} options={aggOptions}/>
              </div>
              <div>
                <FieldLabel>{t.stepOrder}</FieldLabel>
                <CustomSelect value={stepOrder} onChange={function(v){setStepOrder(v);autoRun();}} options={stepOrderOptions}/>
              </div>
              <div>
                <FieldLabel>{t.convCalc}</FieldLabel>
                <CustomSelect value={convCalc} onChange={function(v){setConvCalc(v);}} options={convCalcOptions}/>
                <div style={{fontSize:9,color:C.muted,marginTop:4}}>Applies to funnel chart only</div>
              </div>
              <div>
                <FieldLabel>Conversion Window Limit</FieldLabel>
                <div style={{display:"flex",gap:8}}>
                  <CustomSelect value={convWindowLimitNumber} onChange={function(v){setConvWindowLimitNumber(v);autoRun();}} options={convWindowNumberOptions} style={{flex:1}}/>
                  <CustomSelect value={convWindowLimitUnit} onChange={function(v){setConvWindowLimitUnit(v);autoRun();}} options={convWindowUnitOptions} style={{flex:1}}/>
                </div>
                <div style={{fontSize:9,color:C.muted,marginTop:4}}>Maximum time window for conversion tracking</div>
              </div>
              <div>
                <FieldLabel>{t.breakDownBy}</FieldLabel>
                <CustomSelect value={breakBy} onChange={function(v){setBreakBy(v);autoRun();}} options={[{value:"none",label:t.noBreakdown},{value:"device",label:t.byDevice},{value:"status",label:t.byStatus},{value:"region",label:t.byRegion}]}/>
                <div style={{marginTop:8,padding:"8px 10px",borderRadius:6,background:C.bg,border:`1px solid ${C.border}`}}>
                  {coloredBreakItems.map(function(item){return(
                    <div key={item.key} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                      <div style={{width:8,height:8,borderRadius:2,background:item.color,flexShrink:0}}/>
                      <span style={{fontSize:11,color:C.text3,fontWeight:item.key==="all"?600:400}}>{lang==="zh"?(item.labelZh||item.label):item.label}</span>
                      {item.key==="all"&&<span style={{marginLeft:"auto",fontSize:9,padding:"1px 5px",borderRadius:3,background:C.accentLight,color:C.accent,fontWeight:600}}>ALL</span>}
                      {item.key==="base"&&<span style={{marginLeft:"auto",fontSize:9,padding:"1px 5px",borderRadius:3,background:"#fef2f2",color:C.danger,fontWeight:600}}>Blocked</span>}
                    </div>
                  );})}
                  {breakBy==="status"&&(
                    <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${C.border}`,fontSize:10,color:C.muted,lineHeight:1.5}}>
                      <span style={{fontWeight:600,color:C.danger}}>BASE</span> — downgraded or blocked users.
                    </div>
                  )}
                </div>
              </div>
              <CollapsibleSection label={t.segments} badge={activeFilters.length||null} badgeColor={C.accent}>
                <SegmentFilterContent activeFilters={activeFilters} toggleFilter={toggleFilter} setActiveFilters={setActiveFilters} autoRun={autoRun} lang={lang} t={t}
                  onEnter={function(seg,top,left){setTip({seg,top,left});}} onLeave={function(){setTip(null);}}/>
              </CollapsibleSection>
              <CollapsibleSection label={t.presetFunnels} badge={activePreset?1:null} badgeColor={C.success}>
                <PresetPanelContent customPresets={customPresets} loadingPresets={loadingPresets} activePreset={activePreset} expandedPreset={expandedPreset} setExpandedPreset={setExpandedPreset} loadPreset={loadPreset} setDeleteConfirm={setDeleteConfirm} setShowSaveModal={setShowSaveModal} steps={steps} lang={lang} t={t}/>
              </CollapsibleSection>
            </div>
          </>
        ):(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>
            <button onClick={()=>setPanel(true)} style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:C.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:C.text3}}>›</button>
          </div>
        )}
      </div>

      <div ref={scrollRef} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:16,minWidth:0,padding:"16px 20px 28px",position:"relative"}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:steps.length>0?12:0,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {steps.length>0&&(
                <button onClick={()=>setStepsCollapsed(function(v){return !v;})}
                  style={{width:26,height:26,borderRadius:5,border:`1px solid ${C.border2}`,background:stepsCollapsed?C.accentBg:C.bg,color:stepsCollapsed?C.accent:C.text3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>
                  {stepsCollapsed?"▶":"▼"}
                </button>
              )}
              <div>
                <div style={{fontSize:14,fontWeight:600,color:C.text}}>{t.funnelSteps}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:1}}>{stepsCollapsed&&steps.length>0?t.stepsCollapsed(steps.length):t.stepsCount(steps.length)}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",background:C.bg,borderRadius:6,padding:2,gap:1,border:`1px solid ${C.border}`}}>
                {[{id:"funnel",icon:"⬇",label:"Funnel"},{id:"trends",icon:"📈",label:"Historical Trends"}].map(function(g){return(
                  <button key={g.id} onClick={()=>setGraphType(g.id)}
                    style={{padding:"5px 11px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:graphType===g.id?600:400,background:graphType===g.id?C.card:"transparent",color:graphType===g.id?C.text:C.muted,boxShadow:graphType===g.id?"0 1px 3px rgba(0,0,0,0.08)":"none",whiteSpace:"nowrap"}}>
                    {g.icon} {g.label}
                  </button>
                );})}
              </div>
              <Btn onClick={()=>setShowSaveModal(true)} disabled={steps.length<2}>{t.savePreset}</Btn>
              <Btn onClick={()=>{setSteps([]);setRan(false);setActivePreset(null);setStepsCollapsed(false);}} disabled={steps.length===0} style={{color:C.danger,borderColor:C.danger+"60"}}>{t.clearAll}</Btn>
              <button onClick={handleRefresh} disabled={refreshing||steps.length<2}
                style={{padding:"7px 13px",borderRadius:6,fontSize:12,fontWeight:600,cursor:refreshing||steps.length<2?"not-allowed":"pointer",opacity:refreshing||steps.length<2?0.55:1,border:`1px solid ${C.border2}`,background:C.card,color:C.text3,display:"flex",alignItems:"center",gap:5}}>
                <span style={{display:"inline-block",animation:refreshing?"spin 0.7s linear infinite":"none",fontSize:13}}>↻</span>
                {refreshing?t.refreshing:t.refresh}
              </button>
            </div>
          </div>
          {steps.length===0&&<div style={{padding:"18px",textAlign:"center",color:C.muted,fontSize:12,background:C.bg,borderRadius:6,border:`1px dashed ${C.border2}`,marginBottom:8}}>{t.selectPresetOrAdd}</div>}
          {steps.length===0&&<InlineAddStep addStep={addStep} lang={lang} t={t} onRowEnter={openAddStepTip} onRowLeave={startCloseAddStepTip}/>}
          {steps.length>0&&stepsCollapsed&&<CollapsedSummary/>}
          {steps.length>0&&!stepsCollapsed&&(
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {steps.map(function(id,i){
                const ev=ALL_EVENTS.find(function(e){return e.id===id;});
                const tagColor=TAG_COLORS[ev?ev.tag:""]||C.muted;
                const isDragging=dragIdx===i,isOver=dragOverIdx===i&&dragIdx!==i,isLast=i===steps.length-1;
                return (
                  <div key={i} style={{display:"flex",alignItems:"stretch",gap:0}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:28,flexShrink:0}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:isOver?"#dbeafe":tagColor,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                      {!isLast&&<div style={{flex:1,width:2,background:tagColor,minHeight:12,marginTop:1,marginBottom:1,borderRadius:1,opacity:0.25}}/>}
                    </div>
                    <div draggable onDragStart={()=>onDragStart(i)} onDragOver={e=>onDragOver(e,i)} onDrop={()=>onDrop(i)} onDragEnd={onDragEnd}
                      onMouseEnter={function(e){const r=e.currentTarget.getBoundingClientRect();if(ev)openStepTip(ev,r);}}
                      onMouseLeave={startCloseStepTip}
                      style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"5px 10px",marginLeft:8,marginBottom:isLast?0:6,borderRadius:6,background:isOver?"#dbeafe":C.bg,border:`1px solid ${isOver?C.accent:tagColor+"30"}`,opacity:isDragging?0.35:1,cursor:"grab",userSelect:"none"}}>
                      <span style={{fontSize:11,color:C.muted}}>⠿</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,color:C.text2,fontWeight:500}}>{evLabel(id)}</div>
                        <div style={{fontSize:10,color:tagColor,fontWeight:600,marginTop:1}}>{ev?ev.tag:""}</div>
                      </div>
                      <span onClick={()=>removeStep(id,i)} style={{fontSize:11,cursor:"pointer",color:C.muted,padding:"2px 4px",borderRadius:3}}
                        onMouseEnter={e=>e.currentTarget.style.color=C.danger}
                        onMouseLeave={e=>e.currentTarget.style.color=C.muted}>✕</span>
                    </div>
                  </div>
                );
              })}
              <InlineAddStep addStep={addStep} lang={lang} t={t} onRowEnter={openAddStepTip} onRowLeave={startCloseAddStepTip}/>
            </div>
          )}
        </Card>

        {recalcAnim&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"10px 16px",borderRadius:8,background:C.accentBg,border:`1px solid ${C.accentLight}`,fontSize:12,color:C.accent,fontWeight:600}}>
            <span style={{display:"inline-block",animation:"spin 0.7s linear infinite",fontSize:14}}>↻</span>
            Recalculating for new date range…
          </div>
        )}

        {ran&&result.length>=2&&graphType==="funnel"&&(
          <>
            <Card key={`funnel-${recalcKey}`} style={{padding:"16px 18px 0"}} className="recalc-fade">
              <div style={{marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.funnelChart}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{breakBy!=="none"?"Broken down by "+t.breakdownLabel[breakBy]:"Baseline"}</div>
              </div>
              {(function(){
                const YAXIS_W=44,STEP_W=220;
                const chartW=YAXIS_W+result.length*STEP_W;
                const barRows=(breakBy==="none"?breakdownData:breakdownData.filter(function(r){return r.key!=="all";})).map(function(row){return{key:row.key,name:lang==="zh"?(row.labelZh||row.label):row.label,fill:row.color};});
                return (
                  <div style={{overflowX:"auto",marginLeft:-18,marginRight:-18,paddingLeft:18}}>
                    <div style={{width:chartW}}>
                      <BarChart width={chartW} height={260} data={chartData} barCategoryGap="20%" barGap={1} margin={{top:4,right:18,bottom:4,left:0}}>
                        <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} height={0}/>
                        <YAxis tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false} width={YAXIS_W} tickFormatter={function(v){return v+"%";}} domain={[0,100]}/>
                        <Tooltip content={ChartTooltip} cursor={{fill:"#f3f4f6"}}/>
                        {barRows.map(function(row){return <Bar key={row.key} dataKey={row.key} name={row.name} fill={row.fill} radius={[2,2,0,0]} maxBarSize={36}/>;}) }
                      </BarChart>
                      <div style={{display:"flex",borderTop:`1px solid ${C.border}`}}>
                        <div style={{width:YAXIS_W,flexShrink:0}}/>
                        {result.map(function(step,i){
                          const prev=result[i-1];
                          const ev=ALL_EVENTS.find(function(e){return e.id===step.id;});
                          const tagColor=TAG_COLORS[ev?ev.tag:""]||STEP_COLORS[i%STEP_COLORS.length];
                          const dropped=prev?prev.val-step.val:null;
                          return (
                            <div key={i} style={{width:STEP_W,flexShrink:0,padding:"10px 8px 14px",borderRight:i===result.length-1?"none":`1px solid ${C.border}`}}>
                              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                                <div style={{width:16,height:16,borderRadius:4,background:tagColor,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                                <div style={{fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="zh"?step.labelZh:step.label}</div>
                              </div>
                              {(()=>{
                                const base=convCalc==="relative"
                                  ?(i===0?result[0].val:result[i-1]?result[i-1].val:result[0].val)
                                  :result[0].val;
                                const pct=i===0?null:((step.val/base)*100).toFixed(1);
                                return(
                                  <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                                    <span style={{color:C.success,fontSize:13}}>→</span>
                                    <span style={{fontSize:12,fontWeight:700,color:C.text}}>{step.val.toLocaleString()}</span>
                                    <span style={{fontSize:10,color:C.muted}}>{i===0?(aggregateBy==="sessions"?"sessions":"users"):`(${pct}%)`}</span>
                                  </div>
                                );
                              })()}
                              {dropped!==null&&(
                                <div style={{display:"flex",alignItems:"center",gap:4}}>
                                  <span style={{color:C.danger,fontSize:12}}>↘</span>
                                  <span style={{fontSize:12,fontWeight:700,color:C.text}}>{dropped.toLocaleString()}</span>
                                  <span style={{fontSize:10,color:C.muted}}>({""+((dropped/(prev?prev.val:1))*100).toFixed(1)+"%"})</span>
                                </div>
                              )}
                              {i>0&&step.avgTime!=null&&(
                                <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}>
                                  <span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:C.warnBg,color:C.warn,fontWeight:600}}>⏱ {t.fmtTime(step.avgTime)}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Card>
            <Card key={`table-${recalcKey}`} style={{padding:"14px 18px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8}} className="recalc-fade">
              <div style={{marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:600,color:C.text}}>{t.stepByStep}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{breakBy==="none"?"Baseline only":"By "+t.breakdownLabel[breakBy]+" · "+breakdownData.length+" rows"}</div>
              </div>
              <div style={{display:"flex",gap:11,flexWrap:"wrap",marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
                {coloredBreakItems.map(function(item){return(
                  <div key={item.key} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:8,height:8,borderRadius:2,background:item.color}}/>
                    <span style={{fontSize:11,color:C.text3}}>{lang==="zh"?(item.labelZh||item.label):item.label}</span>
                  </div>
                );})}
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"collapse",fontSize:12,minWidth:"1800px"}}>
                  <thead>
                    <tr style={{backgroundColor:"#f9fafb"}}>
                      <th rowSpan={2} style={{padding:"10px 6px",textAlign:"center",fontSize:11,fontWeight:600,color:C.muted,borderBottom:`2px solid ${C.border}`,borderRight:`2px solid ${C.border}`,whiteSpace:"nowrap",verticalAlign:"middle"}}>{t.breakdown}</th>
                      <th rowSpan={2} style={{padding:"10px 6px",textAlign:"center",fontSize:11,fontWeight:600,color:C.muted,borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap",verticalAlign:"middle"}}>Total Conv%</th>
                      {result.map(function(s,si){
                        const col=STEP_COLORS[si%STEP_COLORS.length];
                        const stepName=lang==="zh"?s.labelZh:s.label;
                        return <th key={si} colSpan={si===0?2:5} style={{padding:"10px 8px",textAlign:"center",fontSize:11,fontWeight:700,color:col,borderBottom:`1px solid ${C.border}`,borderLeft:`2px solid ${col}30`,whiteSpace:"nowrap"}}>
                          <span style={{display:"inline-block",width:"22px",height:"22px",lineHeight:"22px",textAlign:"center",fontWeight:"800",marginRight:"4px",background:col,color:"#fff",borderRadius:"3px"}}>{si+1}</span>{stepName}
                        </th>;
                      })}
                    </tr>
                    <tr style={{backgroundColor:"#f9fafb"}}>
                      {result.map(function(_,si){
                        const col=STEP_COLORS[si%STEP_COLORS.length];
                        const cols=si===0?["Entered","Conv%"]:["Entered","Conv%","From Prev","Dropped","Avg Time"];
                        return cols.map(function(sc,sci){return(
                          <th key={"h-"+si+"-"+sc} style={{padding:"8px",textAlign:"center",fontSize:10,fontWeight:500,color:C.muted,borderBottom:`2px solid ${C.border}`,borderLeft:sci===0?`2px solid ${col}30`:"none",whiteSpace:"nowrap"}}>{sc}</th>
                        );});
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownData.map(function(row,ri){
                      const s1=row.stepData[0]?row.stepData[0].val:1;
                      const isBase=row.key==="all";
                      const rowBg=isBase?"#f0f6ff":(ri%2===0?C.card:"#fafafa");
                      return <tr key={row.key} style={{backgroundColor:rowBg}}>
                        <td style={{padding:"10px 6px",fontSize:12,color:C.text,borderBottom:`1px solid ${C.border}`,borderRight:`2px solid ${C.border}`,whiteSpace:"nowrap"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:8,height:8,borderRadius:2,background:row.color,flexShrink:0}}/>
                            <span style={{fontWeight:isBase?700:400}}>{lang==="zh"?(row.labelZh||row.label):row.label}</span>
                            {isBase&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:C.accentLight,color:C.accent,fontWeight:700}}>ALL</span>}
                          </div>
                        </td>
                        <td style={{padding:"10px 6px",textAlign:"center",fontSize:12,fontWeight:700,color:row.totalConvPct>=20?C.success:row.totalConvPct>=10?C.accent:row.totalConvPct>=5?C.warn:C.danger,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>
                          {row.totalConvPct.toFixed(2)}%
                        </td>
                        {row.stepData.map(function(step,si){
                          const prev=row.stepData[si-1];
                          const convSoFar=step.val/s1*100;
                          const convFromPrev=si===0?100:step.val/(prev?prev.val:1)*100;
                          const dropped=prev?prev.val-step.val:null;
                          return <Fragment key={ri+"-"+si}>
                            <td style={{padding:"10px",textAlign:"center",fontSize:12,color:C.text,borderBottom:`1px solid ${C.border}`,borderLeft:`2px solid ${STEP_COLORS[si%STEP_COLORS.length]}30`,whiteSpace:"nowrap"}}>
                              {step.val.toLocaleString()}
                            </td>
                            <td style={{padding:"10px",textAlign:"center",fontSize:12,color:C.text3,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>
                              {convSoFar.toFixed(1)}%
                            </td>
                            {si>0&&<Fragment>
                              <td style={{padding:"10px",textAlign:"center",fontSize:12,color:convColor(convFromPrev),fontWeight:600,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>
                                {convFromPrev.toFixed(1)}%
                              </td>
                              <td style={{padding:"10px",textAlign:"center",fontSize:12,color:C.danger,fontWeight:600,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>
                                {dropped===null?<span style={{color:C.muted}}>—</span>:dropped.toLocaleString()}
                              </td>
                              <td style={{padding:"10px",textAlign:"center",fontSize:12,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>
                                {step.avgTime===null?<span style={{color:C.muted}}>—</span>:<span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:C.warnBg,color:C.warn,fontWeight:600}}>⏱ {t.fmtTime(step.avgTime)}</span>}
                              </td>
                            </Fragment>}
                          </Fragment>;
                        })}
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {ran&&result.length>=2&&graphType==="trends"&&(
          <Card key={`trends-${recalcKey}`} style={{padding:"16px 18px"}} className="recalc-fade">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>Historical Trends</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{breakBy==="none"?"Overall conversion rate over time":`Conversion by ${t.breakdownLabel[breakBy]} over time`}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:C.muted,fontWeight:500}}>Group by</span>
                <div style={{display:"flex",background:C.bg,borderRadius:6,padding:2,gap:1,border:`1px solid ${C.border}`}}>
                  {["day","week","month"].map(function(g){return(
                    <button key={g} onClick={()=>setGroupBy(g)}
                      style={{padding:"5px 12px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:groupBy===g?600:400,background:groupBy===g?C.card:"transparent",color:groupBy===g?C.text:C.muted,boxShadow:groupBy===g?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
                      {g==="day"?"Day":g==="week"?"Week":"Month"}
                    </button>
                  );})}
                </div>
              </div>
            </div>
            <MultiLineTrendChart trendData={trendData} steps={steps} fromStep={fromStep} toStep={toStep} setFromStep={setFromStep} setToStep={setToStep} result={result} lang={lang} breakdownData={breakdownData} breakBy={breakBy}/>
          </Card>
        )}

        {ran&&result.length>=2&&(
          <div style={{marginTop:4}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:12}}>Correlation Analysis</div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <InlineCorrelatedEvents key={`corr-${recalcKey}`} lang={lang} t={t} result={result} steps={steps} onOpenModal={(ev)=>openCorrModal(ev,result)}/>
              <InlineCorrelatedProperties key={`corrprop-${recalcKey}`} result={result} steps={steps} lang={lang} t={t} onOpenModal={(row)=>openPropModal(row,result)} setTab={setTab} setFocusPropKey={setFocusPropKey}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const BASE_RATES={purchase:10.2,d7:28.0,d30:19.0,referral:8.9,upgrade:9.0};
const CORR_CATEGORIES=[
  {id:"registration",label:"Sign-up Method",labelZh:"注册方式",color:"#2563eb",icon:"📱",events:[
    {id:"reg_referral",label:"Signed Up via Referral",labelZh:"推荐码注册",users:5600,lift:{purchase:3.1,d7:3.8,d30:3.5,referral:5.0,upgrade:2.9}},
    {id:"reg_linked_email",label:"Linked with Email",labelZh:"关联邮箱",users:9400,lift:{purchase:2.0,d7:2.8,d30:2.5,referral:1.7,upgrade:1.9}},
  ]},
  {id:"nodes",label:"VPN Usage",labelZh:"VPN 使用",color:"#475569",icon:"🔒",events:[
    {id:"session_short",label:"Short Session (< 5 min)",labelZh:"短会话",users:12400,lift:{purchase:1.6,d7:2.2,d30:1.9,referral:1.4,upgrade:1.5}},
    {id:"session_medium",label:"Medium Session (5–30 min)",labelZh:"中会话",users:9800,lift:{purchase:2.3,d7:3.2,d30:2.9,referral:1.8,upgrade:2.1}},
    {id:"session_long",label:"Long Session (> 30 min)",labelZh:"长会话",users:6200,lift:{purchase:3.1,d7:4.0,d30:3.7,referral:2.2,upgrade:2.9}},
    {id:"feat_smartmode",label:"Used Smart Mode",labelZh:"使用智能模式",users:4200,lift:{purchase:3.2,d7:3.9,d30:3.6,referral:2.0,upgrade:3.0}},
  ]},
  {id:"sharing",label:"Sharing & Referral",labelZh:"分享与推荐",color:"#0f766e",icon:"🔗",events:[
    {id:"ref_friend_joined",label:"Referred Friend Joined",labelZh:"好友成功加入",users:980,lift:{purchase:2.9,d7:3.3,d30:3.0,referral:6.1,upgrade:2.7}},
    {id:"ref_3plus",label:"Referred 3+ Friends",labelZh:"推荐3位以上",users:520,lift:{purchase:3.4,d7:3.7,d30:3.4,referral:7.8,upgrade:3.1}},
    {id:"ref_5plus",label:"Referred 5+ Friends",labelZh:"推荐5位以上",users:210,lift:{purchase:3.9,d7:4.1,d30:3.8,referral:9.2,upgrade:3.6}},
    {id:"reward_claimed",label:"Claimed Reward",labelZh:"领取奖励",users:2460,lift:{purchase:3.1,d7:3.4,d30:3.1,referral:5.0,upgrade:2.8}},
  ]},
  {id:"monetisation",label:"Monetisation",labelZh:"变现",color:"#b45309",icon:"💳",events:[
    {id:"plan_monthly_vip",label:"Monthly Plan — VIP",labelZh:"月度VIP",users:1400,lift:{purchase:5.8,d7:3.1,d30:2.7,referral:1.9,upgrade:4.6}},
    {id:"plan_annual_vip",label:"Annual Plan — VIP",labelZh:"年度VIP",users:860,lift:{purchase:8.4,d7:3.9,d30:3.6,referral:2.2,upgrade:7.4}},
    {id:"sub_renewed",label:"Renewed Subscription",labelZh:"续费订阅",users:1840,lift:{purchase:9.2,d7:4.2,d30:4.0,referral:2.0,upgrade:8.6}},
    {id:"upgrade_vip_svip",label:"Upgraded VIP → SVIP",labelZh:"VIP升SVIP",users:640,lift:{purchase:8.1,d7:4.0,d30:3.8,referral:2.3,upgrade:9.8}},
  ]},
  {id:"tasks",label:"Tasks Completed",labelZh:"任务完成",color:"#16a34a",icon:"✅",events:[
    {id:"task_share_wa",label:"Sharing Task — WhatsApp",labelZh:"WhatsApp分享",users:3200,lift:{purchase:2.9,d7:3.3,d30:3.1,referral:4.8,upgrade:2.7}},
    {id:"task_share_tg",label:"Sharing Task — Telegram",labelZh:"Telegram分享",users:2600,lift:{purchase:2.7,d7:3.1,d30:2.9,referral:4.4,upgrade:2.5}},
    {id:"task_follow_ig",label:"Follow Task — Instagram",labelZh:"Instagram关注",users:4200,lift:{purchase:2.3,d7:2.9,d30:2.6,referral:3.0,upgrade:2.1}},
  ]},
  {id:"support",label:"Support Resolution",labelZh:"客服解决",color:"#7c3aed",icon:"🎧",events:[
    {id:"sup_self_faq",label:"Self-Resolved via FAQ",labelZh:"自助FAQ",users:5600,lift:{purchase:1.8,d7:2.4,d30:2.2,referral:1.4,upgrade:1.7}},
    {id:"sup_bot",label:"Resolved via AI Chatbot",labelZh:"AI机器人解决",users:2800,lift:{purchase:2.4,d7:3.2,d30:2.9,referral:1.6,upgrade:2.2}},
    {id:"sup_human",label:"Resolved via Human Agent",labelZh:"人工客服解决",users:1600,lift:{purchase:2.1,d7:2.9,d30:2.7,referral:1.4,upgrade:2.0}},
    {id:"sup_unresolved",label:"Issue Unresolved",labelZh:"未解决",users:820,lift:{purchase:1.1,d7:1.4,d30:1.2,referral:1.0,upgrade:1.0}},
  ]},
];
const CORR_OUTCOMES=[
  {id:"purchase",color:"#16a34a"},{id:"d7",color:"#2563eb"},{id:"d30",color:"#7c3aed"},
  {id:"referral",color:"#0f766e"},{id:"upgrade",color:"#b45309"},
];

function CorrelationPage(){
  const t=useT();const lang=useLang();
  const [goalOutcome,setGoalOutcome]=useState("purchase");
  const [selCats,setSelCats]=useState(CORR_CATEGORIES.map(function(c){return c.id;}));
  const [sortBy,setSortBy]=useState("lift");
  const [sortDir,setSortDir]=useState("desc");
  const [showSuccess,setShowSuccess]=useState(true);
  const [showDropoff,setShowDropoff]=useState(true);
  const [selectedRow,setSelectedRow]=useState(null);
  const [page,setPage]=useState(1);
  const PER_PAGE=7;
  const outLabel=function(id){return {purchase:t.outPurchase,d7:t.outD7,d30:t.outD30,referral:t.outReferral,upgrade:t.outUpgrade}[id]||id;};
  const allEvents=useMemo(function(){
    return CORR_CATEGORIES.filter(function(cat){return selCats.includes(cat.id);}).flatMap(function(cat){
      return cat.events.map(function(ev){
        const lift=ev.lift[goalOutcome];
        const baseRate=BASE_RATES[goalOutcome]/100;
        const completed=Math.round(ev.users*lift*baseRate);
        return {...ev,label:lang==="zh"?ev.labelZh:ev.label,catLabel:lang==="zh"?cat.labelZh:cat.label,catColor:cat.color,catIcon:cat.icon,lift,completed,droppedOff:ev.users-completed,isSuccess:lift>=2,opportunity:lift*ev.users};
      });
    });
  },[selCats,goalOutcome,lang]);
  const sorted=useMemo(function(){
    return [...allEvents]
      .filter(function(ev){return (ev.isSuccess&&showSuccess)||(!ev.isSuccess&&showDropoff);})
      .sort(function(a,b){const va=sortBy==="users"?a.users:sortBy==="opportunity"?a.opportunity:a.lift;const vb=sortBy==="users"?b.users:sortBy==="opportunity"?b.opportunity:b.lift;return sortDir==="desc"?vb-va:va-vb;});
  },[allEvents,showSuccess,showDropoff,sortBy,sortDir]);
  const totalPages=Math.ceil(sorted.length/PER_PAGE);
  const paginated=sorted.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const getFindings=function(ev){return [ev.lift>=4?t.findingHigh:ev.lift>=2?t.findingMed:t.findingLow,ev.users<2000?t.findingRare:ev.users<6000?t.findingMinority:t.findingWide];};
  const CheckBox=function(props){const {checked,onChange,color}=props;return(
    <div onClick={onChange} style={{width:16,height:16,borderRadius:3,background:checked?color:"#fff",border:`1.5px solid ${checked?color:C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
      {checked&&<span style={{color:"#fff",fontSize:9,fontWeight:900,lineHeight:1}}>✓</span>}
    </div>
  );};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card style={{padding:"14px 18px"}}>
        <div style={{display:"flex",gap:0,flexWrap:"wrap",alignItems:"stretch"}}>
          <div style={{display:"flex",flexDirection:"column",gap:7,paddingRight:20,borderRight:`1px solid ${C.border}`,marginRight:20}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{t.goalOutcomeLabel}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {CORR_OUTCOMES.map(function(o){const sel=goalOutcome===o.id;return <button key={o.id} onClick={()=>{setGoalOutcome(o.id);setPage(1);setSelectedRow(null);}}
                style={{padding:"5px 11px",borderRadius:5,border:`1.5px solid ${sel?o.color:C.border}`,background:sel?o.color+"15":C.bg,color:sel?o.color:C.muted,fontSize:11,fontWeight:sel?700:400,cursor:"pointer"}}>{outLabel(o.id)}</button>;})}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,flex:1,paddingRight:20,borderRight:`1px solid ${C.border}`,marginRight:20}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{t.eventCategoriesLabel}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {CORR_CATEGORIES.map(function(cat){const sel=selCats.includes(cat.id);return <button key={cat.id} onClick={()=>{setSelCats(function(p){return p.includes(cat.id)?(p.length>1?p.filter(function(x){return x!==cat.id;}):p):[...p,cat.id];});setPage(1);}}
                style={{padding:"4px 9px",borderRadius:4,border:`1px solid ${sel?cat.color:C.border}`,background:sel?cat.color+"12":C.bg,color:sel?cat.color:C.muted,fontSize:11,fontWeight:sel?600:400,cursor:"pointer"}}>{cat.icon} {lang==="zh"?cat.labelZh:cat.label}</button>;})}
            </div>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              <div style={{fontSize:9,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{t.correlationLabel}</div>
              <div style={{display:"flex",gap:10}}>
                <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><CheckBox checked={showSuccess} onChange={()=>setShowSuccess(function(v){return !v;})} color={C.success}/><span style={{fontSize:11,fontWeight:showSuccess?600:400,color:showSuccess?C.success:C.muted}}>{t.successLabel}</span></label>
                <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><CheckBox checked={showDropoff} onChange={()=>setShowDropoff(function(v){return !v;})} color={C.danger}/><span style={{fontSize:11,fontWeight:showDropoff?600:400,color:showDropoff?C.danger:C.muted}}>{t.dropoffLabel}</span></label>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              <div style={{fontSize:9,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{t.sortByLabel}</div>
              <div style={{display:"flex",gap:3}}>
                {[{id:"lift",label:t.liftLabel},{id:"opportunity",label:t.opportunityLabel},{id:"users",label:t.usersLabel}].map(function(s){return(
                  <button key={s.id} onClick={()=>{if(sortBy===s.id)setSortDir(function(d){return d==="desc"?"asc":"desc";});else{setSortBy(s.id);setSortDir("desc");setPage(1);}}}
                    style={{padding:"4px 9px",borderRadius:4,border:`1px solid ${sortBy===s.id?C.accent:C.border}`,background:sortBy===s.id?C.accentBg:C.bg,color:sortBy===s.id?C.accent:C.muted,fontSize:11,fontWeight:sortBy===s.id?600:400,cursor:"pointer"}}>
                    {s.label}{sortBy===s.id&&<span style={{fontSize:9}}> {sortDir==="desc"?"↓":"↑"}</span>}
                  </button>
                );})}
              </div>
            </div>
          </div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:selectedRow?"1fr 290px":"1fr",gap:14,alignItems:"start"}}>
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 90px 100px 1.4fr",padding:"10px 18px",background:"#f9fafb",borderBottom:`2px solid ${C.border2}`}}>
            {[t.corrEventsHeader,t.completedHeader,t.droppedOffHeader,t.keyFindingsHeader].map(function(h,i){return(
              <div key={i} style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:i===1||i===2?"center":"left"}}>{h}</div>
            );})}
          </div>
          {paginated.length===0&&<div style={{padding:"48px",textAlign:"center",color:C.muted,fontSize:13}}>{t.noEventsMatch}</div>}
          {paginated.map(function(ev,i){
            const findings=getFindings(ev);
            const isSel=selectedRow&&selectedRow.id===ev.id;
            const liftBadgeColor=ev.lift>=4?C.success:ev.lift>=2?"#0f766e":C.warn;
            const isLast=i===paginated.length-1;
            return (
              <div key={ev.id} onClick={()=>setSelectedRow(isSel?null:ev)}
                style={{display:"grid",gridTemplateColumns:"2fr 90px 100px 1.4fr",padding:"15px 18px",borderBottom:isLast?"none":`1px solid ${C.border}`,cursor:"pointer",background:isSel?"#eff6ff":"transparent",borderLeft:`3px solid ${isSel?C.accent:"transparent"}`}}
                onMouseEnter={function(e){if(!isSel)e.currentTarget.style.background="#f9fafb";}}
                onMouseLeave={function(e){if(!isSel)e.currentTarget.style.background="transparent";}}>
                <div style={{paddingRight:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:ev.catColor+"15",color:ev.catColor,fontWeight:700}}>{ev.catIcon} {ev.catLabel}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:isSel?C.accent:C.text,marginBottom:5}}>{ev.label}</div>
                  <div style={{fontSize:11,color:C.text3,lineHeight:1.5}}>{t.moreLikely(ev.lift)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.success}}>{ev.completed.toLocaleString()}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:2}}>users</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:14,fontWeight:600,color:C.text3}}>{ev.droppedOff.toLocaleString()}</div>
                    <div style={{fontSize:9,color:C.muted,marginTop:2}}>users</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {findings.map(function(f,fi){return(
                    <div key={fi} style={{display:"flex",alignItems:"flex-start",gap:6,fontSize:11,color:C.text3,lineHeight:1.45}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:fi===0?liftBadgeColor:C.border2,flexShrink:0,marginTop:3}}/>
                      <span>{f}</span>
                    </div>
                  );})}
                </div>
              </div>
            );
          })}
          {totalPages>1&&(
            <div style={{padding:"10px 18px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,background:"#fafafa"}}>
              <span style={{fontSize:11,color:C.muted}}>{t.paginationText((page-1)*PER_PAGE+1,Math.min(page*PER_PAGE,sorted.length),sorted.length)}</span>
              <button onClick={()=>setPage(function(p){return Math.max(1,p-1);})} disabled={page===1} style={{width:28,height:28,borderRadius:5,border:`1px solid ${C.border}`,background:C.card,cursor:page===1?"not-allowed":"pointer",opacity:page===1?0.4:1,fontSize:14,color:C.text3,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <button onClick={()=>setPage(function(p){return Math.min(totalPages,p+1);})} disabled={page===totalPages} style={{width:28,height:28,borderRadius:5,border:`1px solid ${C.border}`,background:C.card,cursor:page===totalPages?"not-allowed":"pointer",opacity:page===totalPages?0.4:1,fontSize:14,color:C.text3,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>
          )}
        </Card>
        {selectedRow&&(
          <Card>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:10,fontWeight:600,color:selectedRow.catColor,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{selectedRow.catIcon} {selectedRow.catLabel}</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{selectedRow.label}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>vs <span style={{fontWeight:600}}>{outLabel(goalOutcome)}</span></div>
                </div>
                <button onClick={()=>setSelectedRow(null)} style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${C.border}`,background:C.bg,fontSize:11,color:C.muted,cursor:"pointer"}}>✕</button>
              </div>
              <div style={{textAlign:"center",padding:"16px 12px",borderRadius:8,background:C.bg,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:44,fontWeight:900,color:selectedRow.lift>=4?C.success:selectedRow.lift>=2?C.accent:C.warn,lineHeight:1}}>{selectedRow.lift}×</div>
                <div style={{fontSize:11,color:C.text3,marginTop:4}}>lift vs non-converters</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{padding:"12px",borderRadius:7,background:C.successBg,border:"1px solid #bbf7d0"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:3,fontWeight:600,textTransform:"uppercase"}}>Converted</div>
                  <div style={{fontSize:24,fontWeight:800,color:C.success}}>{selectedRow.completed.toLocaleString()}</div>
                </div>
                <div style={{padding:"12px",borderRadius:7,background:C.dangerBg,border:"1px solid #fecaca"}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:3,fontWeight:600,textTransform:"uppercase"}}>Dropped</div>
                  <div style={{fontSize:24,fontWeight:800,color:C.danger}}>{selectedRow.droppedOff.toLocaleString()}</div>
                </div>
              </div>
              <div style={{padding:"8px 10px",borderRadius:6,background:C.accentBg,borderLeft:`3px solid ${C.accent}`,fontSize:11,color:C.text3,lineHeight:1.6}}>
                Users who did <strong>{selectedRow.label}</strong> converted at <strong>{selectedRow.lift}×</strong> the rate of those who didn't.
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function EventDefinitionsPage({descriptions,setDescriptions}){
  const lang=useLang();
  const [search,setSearch]=useState("");
  const [tagFilter,setTagFilter]=useState("All");
  const [typeFilter,setTypeFilter]=useState("All");
  const [sortDir,setSortDir]=useState("asc");
  const [editingId,setEditingId]=useState(null);
  const [editDraft,setEditDraft]=useState("");
  const editRef=useRef();
  const typeOpts=[
    {key:"All",label:"All Types"},
    {key:"pageview",label:"Page Views",color:TYPE_COLORS.pageview},
    {key:"custom",label:"Custom Events",color:TYPE_COLORS.custom},
  ];
  const visibleTags=useMemo(()=>["All",...Object.keys(TAG_COLORS)],[]);
  const filtered=useMemo(function(){
    return [...ALL_EVENTS]
      .filter(function(e){
        const ms=search===""||e.label.toLowerCase().includes(search.toLowerCase())||e.id.toLowerCase().includes(search.toLowerCase())||(e.labelZh&&e.labelZh.includes(search));
        const mt=tagFilter==="All"||e.tag===tagFilter;
        const mtype=typeFilter==="All"||e.type===typeFilter;
        return ms&&mt&&mtype;
      })
      .sort(function(a,b){
        return a.tag.localeCompare(b.tag);
      });
  },[search,tagFilter,typeFilter]);
  const startEdit=function(id){setEditingId(id);setEditDraft(descriptions[id]||"");setTimeout(function(){if(editRef.current)editRef.current.focus();},50);};
  const saveEdit=function(id){setDescriptions(function(prev){const n={...prev};n[id]=editDraft.trim();return n;});setEditingId(null);};
  const groupedByTag=useMemo(()=>{
    const groups={};
    filtered.forEach(ev=>{if(!groups[ev.tag])groups[ev.tag]=[];groups[ev.tag].push(ev);});
    Object.keys(groups).forEach(tag=>{
      groups[tag].sort(function(a,b){
        if(a.type!==b.type){
          if(a.type==="pageview")return -1;
          if(b.type==="pageview")return 1;
        }
        return sortDir==="asc"?a.label.localeCompare(b.label):b.label.localeCompare(a.label);
      });
    });
    return groups;
  },[filtered,sortDir]);
  const tagOrder=Object.keys(TAG_COLORS);
  const groupKeys=tagOrder.filter(t=>groupedByTag[t]);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:"1",minWidth:180,maxWidth:280}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:C.muted}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search for events…"
              style={{width:"100%",padding:"7px 10px 7px 30px",borderRadius:7,border:`1px solid ${C.border2}`,fontSize:12,color:C.text,outline:"none",boxSizing:"border-box",background:C.card}}/>
          </div>
          <div style={{marginLeft:"auto",padding:"5px 11px",borderRadius:6,background:"#f0fdf4",border:"1px solid #bbf7d0",fontSize:11,color:C.success,fontWeight:600}}>
            {filtered.length} event{filtered.length!==1?"s":""}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:600,color:C.muted,flexShrink:0}}>Type</span>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {typeOpts.map(opt=>{const sel=typeFilter===opt.key;const col=opt.color||C.accent;return(
              <button key={opt.key} onClick={()=>{setTypeFilter(opt.key);setTagFilter("All");}}
                style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${sel?col:C.border}`,background:sel?col+"15":"transparent",color:sel?col:C.muted,fontSize:11,fontWeight:sel?700:400,cursor:"pointer"}}>
                {opt.label}
              </button>
            );})}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:600,color:C.muted,flexShrink:0}}>Tag</span>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {visibleTags.map(tg=>{const col=TAG_COLORS[tg];const sel=tagFilter===tg;return(
              <button key={tg} onClick={()=>setTagFilter(tg)}
                style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${sel?(col||C.accent):C.border}`,background:sel?(col||C.accent)+"15":"transparent",color:sel?(col||C.accent):C.muted,fontSize:11,fontWeight:sel?700:400,cursor:"pointer"}}>
                {tg==="All"?"All tags":tg}
              </button>
            );})}
          </div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {groupKeys.map(function(tag){
          const evs=groupedByTag[tag];
          if(!evs||!evs.length)return null;
          const tagColor=TAG_COLORS[tag]||C.muted;
          return (
            <div key={tag} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 18px",background:tagColor+"0d",borderBottom:`1px solid ${tagColor}25`}}>
                <div style={{width:10,height:10,borderRadius:2,background:tagColor}}/>
                <span style={{fontSize:12,fontWeight:700,color:tagColor}}>{tag}</span>
                <span style={{fontSize:10,color:tagColor,opacity:0.7}}>{evs.length} event{evs.length!==1?"s":""}</span>
                <div style={{marginLeft:"auto",cursor:"pointer",fontSize:10,color:C.muted}} onClick={()=>setSortDir(d=>d==="asc"?"desc":"asc")}>Name {sortDir==="asc"?"↑":"↓"}</div>
              </div>
              {evs.map(function(ev,i){
                const isEditing=editingId===ev.id;
                const desc=descriptions[ev.id]||"";
                const isLast=i===evs.length-1;
                const evTypeColor=TYPE_COLORS[ev.type]||C.muted;
                const evTypeLabel=TYPE_LABELS[ev.type]||ev.type;
                return (
                  <div key={ev.id} style={{borderBottom:isLast?"none":`1px solid ${C.border}`,background:isEditing?C.accentBg:"transparent"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 120px 90px",padding:"12px 18px",alignItems:"center",gap:8}}>
                      <div style={{paddingRight:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"monospace"}}>{ev.id}</span>
                          {lang==="zh"&&<span style={{fontSize:11,color:C.muted}}>· {ev.labelZh}</span>}
                        </div>
                        <div style={{fontSize:12,color:C.text2,marginBottom:4}}>{ev.label}</div>
                        {isEditing?(
                          <div>
                            <textarea ref={editRef} value={editDraft} onChange={e=>setEditDraft(e.target.value)} rows={2}
                              style={{width:"100%",padding:"6px 9px",borderRadius:5,border:`1.5px solid ${C.accent}`,fontSize:11,color:C.text,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5}}/>
                            <div style={{display:"flex",gap:6,marginTop:5}}>
                              <button onClick={()=>saveEdit(ev.id)} style={{padding:"4px 12px",borderRadius:5,border:"none",background:C.accent,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>Save</button>
                              <button onClick={()=>setEditingId(null)} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border2}`,background:C.card,color:C.muted,fontSize:11,cursor:"pointer"}}>Cancel</button>
                            </div>
                          </div>
                        ):(
                          desc?<div style={{fontSize:11,color:C.text3,lineHeight:1.5}}>{desc}</div>
                            :<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>No description —</div>
                        )}
                      </div>
                      <div>
                        <span style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:evTypeColor+"15",color:evTypeColor,fontWeight:600,border:`1px solid ${evTypeColor}30`}}>{evTypeLabel}</span>
                      </div>
                      <div>
                        {!isEditing&&(
                          <button onClick={()=>startEdit(ev.id)}
                            style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,color:C.text3,fontSize:11,fontWeight:500,cursor:"pointer"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.text3;}}>
                            ✏️ Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ALL_PROPERTIES=[
  {key:"email",label:"Email",type:"String",desc:"User's email address."},
  {key:"traffic_tag",label:"Traffic Tag",type:"Array",desc:"Classifies users based on data consumption in the recent 30 days."},
  {key:"activity_tag",label:"Activity Tag",type:"Array",desc:"Measures user engagement frequency in the recent 30 days."},
  {key:"payment_duration_tag",label:"Payment Duration Tag",type:"Array",desc:"Measures the total accumulated duration of all subscription plans purchased."},
  {key:"account_tenure_tag",label:"Account Tenure Tag",type:"Array",desc:"Classifies users by account age based on registration date."},
  {key:"country",label:"Country",type:"String",desc:"List of countries."},
  {key:"device_type",label:"Device Type",type:"Array",desc:"Android, MacOS, iOS, Linux, Windows."},
  {key:"paid_amount",label:"Paid Amount",type:"Numeric",desc:"Total amount of money spent by the user."},
  {key:"version_number",label:"Version Number",type:"Numeric",desc:"User's current version number."},
  {key:"user_role",label:"User Role",type:"Array",desc:"Free, Base, VIP, SVIP."},
  {key:"provinces",label:"Provinces (China)",type:"Array",desc:"Anhui, Fujian, Gansu, Guangdong, Guizhou, Hainan, Hebei, Heilongjiang, Henan, Hubei, Hunan, Jiangsu, Jiangxi, Jilin, Liaoning, Qinghai, Shaanxi, Shandong, Shanxi, Sichuan, Yunnan, Zhejiang, Taiwan."},
  {key:"referree_count",label:"Referree Count",type:"Numeric",desc:"Number of direct referees (tier 1 fanclub)."},
  {key:"acquisition_source",label:"Acquisition Source",type:"Array",desc:"Organic, Referral, Agent."},
  {key:"user_type",label:"User Type",type:"Array",desc:"Agent, Customer."},
];

const PROP_TYPE_COLORS={String:"#0369a1",Array:"#7c3aed",Numeric:"#b45309"};

function PropertyDefinitionsPage({focusPropKey,setFocusPropKey}){
  const [search,setSearch]=useState("");
  const [typeFilter,setTypeFilter]=useState("All");
  const [editingKey,setEditingKey]=useState(null);
  const [editDraft,setEditDraft]=useState("");
  const [propDescs,setPropDescs]=useState(Object.fromEntries(ALL_PROPERTIES.map(p=>[p.key,p.desc])));
  const editRef=useRef();
  const focusRef=useRef(null);
  useEffect(()=>{
    if(!focusPropKey)return;
    setEditingKey(focusPropKey);
    setEditDraft(propDescs[focusPropKey]||"");
    setTimeout(()=>{if(focusRef.current)focusRef.current.scrollIntoView({behavior:"smooth",block:"center"});if(editRef.current)editRef.current.focus();},100);
    if(setFocusPropKey)setFocusPropKey(null);
  },[focusPropKey]);
  const typeOpts=["All","String","Array","Numeric"];
  const filtered=useMemo(()=>ALL_PROPERTIES.filter(p=>{
    const ms=search===""||p.label.toLowerCase().includes(search.toLowerCase())||p.key.toLowerCase().includes(search.toLowerCase());
    const mt=typeFilter==="All"||p.type===typeFilter;
    return ms&&mt;
  }).sort((a,b)=>a.label.localeCompare(b.label)),[search,typeFilter]);
  const startEdit=function(key){setEditingKey(key);setEditDraft(propDescs[key]||"");setTimeout(function(){if(editRef.current)editRef.current.focus();},50);};
  const saveEdit=function(key){setPropDescs(function(prev){return {...prev,[key]:editDraft.trim()};});setEditingKey(null);};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:"1",minWidth:180,maxWidth:280}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:C.muted}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search properties…"
            style={{width:"100%",padding:"7px 10px 7px 30px",borderRadius:7,border:`1px solid ${C.border2}`,fontSize:12,color:C.text,outline:"none",boxSizing:"border-box",background:C.card}}/>
        </div>
        <div style={{display:"flex",gap:4}}>
          {typeOpts.map(opt=>{const col=PROP_TYPE_COLORS[opt];const sel=typeFilter===opt;return(
            <button key={opt} onClick={()=>setTypeFilter(opt)}
              style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${sel?(col||C.accent):C.border}`,background:sel?(col||C.accent)+"15":"transparent",color:sel?(col||C.accent):C.muted,fontSize:11,fontWeight:sel?700:400,cursor:"pointer"}}>
              {opt==="All"?"All types":opt}
            </button>
          );})}
        </div>
        <div style={{marginLeft:"auto",padding:"5px 11px",borderRadius:6,background:"#f0fdf4",border:"1px solid #bbf7d0",fontSize:11,color:C.success,fontWeight:600}}>
          {filtered.length} propert{filtered.length!==1?"ies":"y"}
        </div>
      </div>
      <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 120px 90px",padding:"10px 18px",background:"#f9fafb",borderBottom:`2px solid ${C.border2}`}}>
          <div style={{fontSize:11,fontWeight:600,color:C.muted}}>Property</div>
          <div style={{fontSize:11,fontWeight:600,color:C.muted}}>Type</div>
          <div/>
        </div>
        {filtered.length===0&&<div style={{padding:"32px",textAlign:"center",color:C.muted,fontSize:12}}>No properties match your search.</div>}
        {filtered.map(function(prop,i){
          const isEditing=editingKey===prop.key;
          const isLast=i===filtered.length-1;
          const typeColor=PROP_TYPE_COLORS[prop.type]||C.muted;
          const desc=propDescs[prop.key]||"";
          return(
            <div key={prop.key} style={{borderBottom:isLast?"none":`1px solid ${C.border}`,background:isEditing?C.accentBg:"transparent"}}
              ref={prop.key===focusPropKey?focusRef:null}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 120px 90px",padding:"13px 18px",alignItems:"start",gap:8}}>
                <div style={{paddingRight:12}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:"monospace",marginBottom:3}}>{prop.key}</div>
                  <div style={{fontSize:12,color:C.text2,marginBottom:4}}>{prop.label}</div>
                  {isEditing?(
                    <div>
                      <textarea ref={editRef} value={editDraft} onChange={e=>setEditDraft(e.target.value)} rows={2}
                        style={{width:"100%",padding:"6px 9px",borderRadius:5,border:`1.5px solid ${C.accent}`,fontSize:11,color:C.text,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5}}/>
                      <div style={{display:"flex",gap:6,marginTop:5}}>
                        <button onClick={()=>saveEdit(prop.key)} style={{padding:"4px 12px",borderRadius:5,border:"none",background:C.accent,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>Save</button>
                        <button onClick={()=>setEditingKey(null)} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border2}`,background:C.card,color:C.muted,fontSize:11,cursor:"pointer"}}>Cancel</button>
                      </div>
                    </div>
                  ):(
                    desc?<div style={{fontSize:11,color:C.text3,lineHeight:1.5}}>{desc}</div>
                      :<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>No description —</div>
                  )}
                </div>
                <div style={{paddingTop:2}}>
                  <span style={{fontSize:11,padding:"3px 9px",borderRadius:4,background:typeColor+"15",color:typeColor,fontWeight:600,border:`1px solid ${typeColor}30`}}>{prop.type}</span>
                </div>
                <div style={{paddingTop:1}}>
                  {!isEditing&&(
                    <button onClick={()=>startEdit(prop.key)}
                      style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,color:C.text3,fontSize:11,fontWeight:500,cursor:"pointer"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.text3;}}>
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrendsPage({lang,dateRange}){
  const {days:periodDays,startDate:periodStart}=dateRange;
  const t=useT();

  const [seriesList,setSeriesList]=useState([
    {id:"s1",eventId:"node_connected",color:genSeriesColor(0)},
    {id:"s2",eventId:"node_connection_failed",color:genSeriesColor(1)},
    {id:"s3",eventId:"payment_completed",color:genSeriesColor(2)},
    {id:"s4",eventId:"payment_initiated",color:genSeriesColor(3)},
  ]);
  const [addOpen,setAddOpen]=useState(false);
  const [addSearch,setAddSearch]=useState("");
  const [addTagFilter,setAddTagFilter]=useState("All");
  const [addTypeFilter,setAddTypeFilter]=useState("All");
  const addRef=useRef();

  const [groupBy,setGroupBy]=useState("day");
  const [chartType,setChartType]=useState("line");
  const [compareMode,setCompareMode]=useState("none");
  const [compareVal,setCompareVal]=useState(1);
  const [compareUnit,setCompareUnit]=useState("months");
  const [compareDropOpen,setCompareDropOpen]=useState(false);
  const [compareCustomStart,setCompareCustomStart]=useState("");
  const [compareCustomExpanded,setCompareCustomExpanded]=useState(false);
  const compareRef=useRef();

  useEffect(()=>{
    if(!compareDropOpen)return;
    const h=e=>{if(compareRef.current&&!compareRef.current.contains(e.target))setCompareDropOpen(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[compareDropOpen]);

  const comparePrev=compareMode!=="none";
  const compareLabel=compareMode==="none"?"No comparison between periods":compareMode==="prev"?"Compare to previous period":compareMode==="custom"&&compareCustomStart?`Compare to ${new Date(compareCustomStart).toLocaleDateString()} - ${new Date(new Date(compareCustomStart).getTime() + periodDays*24*60*60*1000).toLocaleDateString()}`:`Compare to ${compareVal} ${compareUnit} earlier`;
  const [breakBy,setBreakBy]=useState("none");

  useEffect(()=>{
    if(!addOpen)return;
    const h=e=>{if(addRef.current&&!addRef.current.contains(e.target))setAddOpen(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[addOpen]);

  const addSeries=function(ev){
    setSeriesList(function(p){return [...p,{id:"s"+Date.now(),eventId:ev.id,color:genSeriesColor(p.length)}];});
    setAddOpen(false);setAddSearch("");
  };
  const removeSeries=function(id){setSeriesList(function(p){return p.filter(s=>s.id!==id);});};

  const labels=useMemo(()=>{
    const pts=groupBy==="day"?Math.min(periodDays,90):groupBy==="week"?Math.max(1,Math.ceil(periodDays/7)):Math.max(1,Math.ceil(periodDays/30));
    const DAY_NAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return Array.from({length:pts},(_,i)=>{
      const d=new Date(periodStart);
      if(groupBy==="day"){d.setDate(d.getDate()+i);const dayName=DAY_NAMES[d.getDay()];const dateStr=d.getDate().toString().padStart(2,"0");const month=d.toLocaleString("default",{month:"short"});const year=d.getFullYear();return{label:`${month} ${dateStr}`,fullLabel:`${dayName}, ${dateStr} ${month} ${year}`,date:new Date(d)};}
      if(groupBy==="week"){d.setDate(d.getDate()+i*7);const dayName=DAY_NAMES[d.getDay()];const dateStr=d.getDate().toString().padStart(2,"0");const month=d.toLocaleString("default",{month:"short"});const year=d.getFullYear();return{label:`${month} ${dateStr}`,fullLabel:`${dayName}, ${dateStr} ${month} ${year}`,date:new Date(d)};}
      d.setMonth(d.getMonth()+i);const dayName=DAY_NAMES[d.getDay()];const dateStr=d.getDate().toString().padStart(2,"0");const month=d.toLocaleString("default",{month:"short"});const year=d.getFullYear();return{label:`${month} ${dateStr}`,fullLabel:`${dayName}, ${dateStr} ${month} ${year}`,date:new Date(d)};
    });
  },[groupBy,periodDays,periodStart]);

  const seriesData=useMemo(()=>{
    return seriesList.map(function(s){
      const base=BASE_COUNTS[s.eventId]||3000;
      const scale=periodDays/30;
      const raw=labels.map(function(_,i){
        const noise=Math.sin(i*0.8+s.id.length*0.5)*base*0.18+Math.cos(i*1.2+s.id.charCodeAt(1)*0.01)*base*0.10;
        return Math.max(0,Math.round(base*scale/labels.length+noise));
      });
      const points=raw;
      const prev=points.map(function(v,i){return Math.max(0,Math.round(v*(0.65+Math.sin(i*0.4)*0.15)));});
      return {...s,points,prev,total:points.reduce((a,b)=>a+b,0)};
    });
  },[seriesList,labels,periodDays]);

  const [tooltip,setTooltip]=useState(null);
  const [pinnedTooltip,setPinnedTooltip]=useState(null);
  const svgRef=useRef();
  const containerRef=useRef();
  const W_MIN=typeof window!=="undefined"?Math.max(600,window.innerWidth-100):600;
  const chartW=Math.max(W_MIN,labels.length*36);
  const baseH=260;
  const extraHeight=Math.max(0,(seriesList.length-2)*25)+(comparePrev?seriesList.length*15:0);
  const H=baseH+extraHeight,PL=52,PR=20,PT=16,PB=32;
  const innerW=chartW-PL-PR,innerH=H-PT-PB;
  const allVals=seriesData.flatMap(s=>comparePrev?[...s.points,...s.prev]:s.points);
  const maxVal=Math.max(...allVals,1);
  const ticksAndMax=useMemo(()=>{
    const magnitude=Math.pow(10,Math.floor(Math.log10(maxVal)));
    const normalized=maxVal/magnitude;
    let step=magnitude/2;
    if(normalized>6)step=magnitude;
    const axisMax=Math.ceil(maxVal/step)*step;
    const ticks=[];for(let v=0;v<=axisMax;v+=step)ticks.push(Math.round(v));
    return {ticks,axisMax};
  },[maxVal]);
  const yTicks=ticksAndMax.ticks;
  const axisMax=ticksAndMax.axisMax;
  const yScale=v=>PT+innerH-(v/axisMax)*innerH;
  const xScale=i=>PL+(labels.length<2?innerW/2:i*(innerW/(labels.length-1)));
  const every=Math.ceil(labels.length/12);

  const handleMouseMove=e=>{
    if(!svgRef.current||pinnedTooltip)return;
    const rect=svgRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left;
    if(mx<PL||mx>chartW-PR){setTooltip(null);return;}
    const idx=Math.max(0,Math.min(labels.length-1,Math.round((mx-PL)/innerW*(labels.length-1))));
    const wRect=svgRef.current.parentElement.getBoundingClientRect();
    setTooltip({idx,x:xScale(idx),relX:e.clientX-wRect.left,relY:e.clientY-wRect.top});
  };

  const handleMouseLeave=e=>{
    if(pinnedTooltip)return;
    setTooltip(null);
  };

  const handleSvgClick=e=>{
    if(!tooltip)return;
    setPinnedTooltip(tooltip);
  };

  const closeTooltip=()=>{
    setTooltip(null);
    setPinnedTooltip(null);
  };

  const tableLabels=labels.slice(0,14);
  const DAY_ABBR=["SU","MO","TU","WE","TH","FR","SA"];
  const fmtColDate=function(d){
    const day=DAY_ABBR[d.getDay()];
    const dd=d.getDate();
    const mon=d.toLocaleString("default",{month:"short"}).toUpperCase();
    return{day,main:`${dd} ${mon}`,date:d};
  };

  const prevOffsetMs=useMemo(()=>{
    if(compareMode==="none")return 0;
    if(compareMode==="prev")return periodDays*24*60*60*1000;
    if(compareMode==="custom"&&compareCustomStart){
      const currentStart=periodStart.getTime();
      const compareStart=new Date(compareCustomStart).getTime();
      return currentStart - compareStart;
    }
    const n=compareVal;
    if(compareUnit==="days")return n*24*60*60*1000;
    if(compareUnit==="weeks")return n*7*24*60*60*1000;
    return n*30*24*60*60*1000;
  },[compareMode,compareVal,compareUnit,periodDays,periodStart,compareCustomStart]);

  const evLabel=id=>{const ev=ALL_EVENTS.find(e=>e.id===id);return lang==="zh"?(ev?ev.labelZh:id):(ev?ev.label:id);};

  const filteredAdd=ALL_EVENTS.filter(e=>{
    const matchQ=addSearch===""||e.label.toLowerCase().includes(addSearch.toLowerCase())||e.labelZh.includes(addSearch)||e.tag.toLowerCase().includes(addSearch.toLowerCase());
    const matchTag=addTagFilter==="All"||e.tag===addTagFilter;
    const matchType=addTypeFilter==="All"||e.type===addTypeFilter;
    return matchQ&&matchTag&&matchType;
  });

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card style={{padding:"16px 12px"}}>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Series</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {seriesList.length===0?(
                <div style={{fontSize:11,color:C.muted,padding:"12px",textAlign:"center",borderRadius:6,background:C.bg,border:`1px dashed ${C.border}`}}>
                  Select an event
                </div>
              ):(
                seriesList.map(function(s,si){
                  const ev=ALL_EVENTS.find(e=>e.id===s.eventId);
                  const tagColor=TAG_COLORS[ev?ev.tag:""]||C.muted;
                return(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:24,height:24,borderRadius:6,background:s.color,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {String.fromCharCode(65+si)}
                    </div>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:7,padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border2}`,background:"#f9fafb",minWidth:0}}>
                      <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:tagColor+"15",color:tagColor,fontWeight:700,flexShrink:0}}>{ev?ev.tag:""}</span>
                      <span style={{fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{evLabel(s.eventId)}</span>
                      <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:TYPE_COLORS[ev?ev.type:"custom"]+"15",color:TYPE_COLORS[ev?ev.type:"custom"],fontWeight:600,flexShrink:0,marginLeft:"auto"}}>{TYPE_LABELS[ev?ev.type:"custom"]}</span>
                    </div>
                    {seriesList.length>1&&<button onClick={()=>removeSeries(s.id)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${C.border}`,background:C.card,cursor:"pointer",fontSize:12,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
                      onMouseEnter={e=>e.currentTarget.style.color=C.danger} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>✕</button>}
                  </div>
                );
                })
              )}
              <div ref={addRef} style={{position:"relative",marginTop:4}}>
                  <button onClick={()=>setAddOpen(v=>!v)}
                    style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"7px 12px",borderRadius:6,cursor:"pointer",border:`1.5px dashed ${addOpen?C.accent:C.border2}`,background:addOpen?C.accentBg:C.bg,color:addOpen?C.accent:C.muted,fontSize:11,fontWeight:500,transition:"all 0.15s"}}>
                    <span style={{fontSize:14,lineHeight:1}}>+</span> Add graph series
                  </button>
                  {addOpen&&(
                    <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:400,background:C.card,border:`1px solid ${C.border2}`,borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.13)",overflow:"hidden"}}>
                      <div style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:6,flexDirection:"column"}}>
                        <input autoFocus value={addSearch} onChange={e=>setAddSearch(e.target.value)} placeholder="Search steps…"
                          style={{width:"100%",padding:"6px 9px",borderRadius:5,border:`1px solid ${C.border2}`,fontSize:11,color:C.text,outline:"none",boxSizing:"border-box"}}/>
                        <div style={{display:"flex",gap:3}}>
                          {[{key:"All",label:"All Types",color:C.muted},{key:"pageview",label:"Page Views",color:TYPE_COLORS.pageview},{key:"custom",label:"Custom Events",color:TYPE_COLORS.custom}].map(opt=>(
                            <button key={opt.key} onClick={()=>setAddTypeFilter(opt.key)}
                              style={{padding:"2px 9px",borderRadius:4,border:`1px solid ${addTypeFilter===opt.key?(opt.color===C.muted?C.accent:opt.color):C.border}`,background:addTypeFilter===opt.key?(opt.color===C.muted?C.accent:opt.color)+"18":"transparent",color:addTypeFilter===opt.key?(opt.color===C.muted?C.accent:opt.color):C.muted,fontSize:10,fontWeight:addTypeFilter===opt.key?700:400,cursor:"pointer"}}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {addTypeFilter==="All"&&(
                          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                            {["All",...Object.keys(TAG_COLORS)].map(tg=>(
                              <button key={tg} onClick={()=>setAddTagFilter(tg)}
                                style={{padding:"2px 8px",borderRadius:4,border:`1px solid ${addTagFilter===tg?(TAG_COLORS[tg]||C.accent):C.border}`,background:addTagFilter===tg?(TAG_COLORS[tg]||C.accent)+"15":"transparent",color:addTagFilter===tg?(TAG_COLORS[tg]||C.accent):C.muted,fontSize:10,fontWeight:addTagFilter===tg?700:400,cursor:"pointer"}}>
                                {tg}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{maxHeight:240,overflowY:"auto",padding:"4px 6px",display:"flex",flexDirection:"column",gap:1}}>
                        {filteredAdd.length===0&&<div style={{fontSize:11,color:C.muted,textAlign:"center",padding:"10px 0"}}>No results</div>}
                        {filteredAdd.map(function(ev){
                          const tagColor=TAG_COLORS[ev.tag]||C.muted;
                          const typeColor=TYPE_COLORS[ev.type]||C.muted;
                          const typeLabel=TYPE_LABELS[ev.type]||ev.type;
                          const already=seriesList.some(s=>s.eventId===ev.id);
                          return(
                            <div key={ev.id}
                              onClick={()=>!already&&addSeries(ev)}
                              style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:5,cursor:already?"default":"pointer",opacity:already?0.4:1,background:"transparent"}}
                              onMouseEnter={e=>{if(!already)e.currentTarget.style.background=C.accentBg;}}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <div style={{width:5,height:5,borderRadius:1,background:tagColor,flexShrink:0}}/>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:12,color:C.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="zh"?ev.labelZh:ev.label}</div>
                                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
                                  <span style={{fontSize:9,color:tagColor,fontWeight:600}}>{ev.tag}</span>
                                  <span style={{fontSize:9,color:C.muted}}>·</span>
                                  <span style={{fontSize:9,padding:"0px 5px",borderRadius:3,background:typeColor+"15",color:typeColor,fontWeight:600}}>{typeLabel}</span>
                                </div>
                              </div>
                              {!already&&<span style={{fontSize:13,color:C.accent,fontWeight:700,flexShrink:0}}>+</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>
          <div style={{minWidth:180,display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Breakdown by</div>
              <CustomSelect value={breakBy} onChange={setBreakBy} options={[
                {value:"none",label:"No breakdown"},{value:"device",label:"By Device"},
                {value:"status",label:"By User Role"},{value:"region",label:"By Region"},
              ]}/>
            </div>
            {seriesList.length>0&&<button onClick={()=>setSeriesList([])} style={{width:"100%",padding:"6px 12px",borderRadius:6,border:`1px solid ${C.border2}`,background:C.card,color:C.danger,fontSize:11,fontWeight:500,cursor:"pointer"}}>
              Clear all
            </button>}
          </div>
        </div>
      </Card>

      {seriesList.length>0&&<Card style={{padding:"14px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{display:"flex",background:C.bg,borderRadius:6,padding:2,gap:1,border:`1px solid ${C.border}`}}>
            {["day","week","month"].map(g=>(
              <button key={g} onClick={()=>setGroupBy(g)}
                style={{padding:"4px 11px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:groupBy===g?600:400,background:groupBy===g?C.card:"transparent",color:groupBy===g?C.text:C.muted,boxShadow:groupBy===g?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
                {g==="day"?"Day":g==="week"?"Week":"Month"}
              </button>
            ))}
          </div>
          <div ref={compareRef} style={{position:"relative"}}>
            <button onClick={()=>setCompareDropOpen(v=>!v)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 11px",borderRadius:6,border:`1px solid ${compareDropOpen||compareMode!=="none"?C.accent:C.border2}`,background:compareDropOpen||compareMode!=="none"?C.accentBg:C.card,color:compareDropOpen||compareMode!=="none"?C.accent:C.muted,fontSize:11,cursor:"pointer",fontWeight:compareMode!=="none"?600:400}}>
              <span style={{fontSize:12}}>⏱</span>
              {compareLabel}
              <span style={{fontSize:9,marginLeft:2,display:"inline-block",transform:compareDropOpen?"rotate(180deg)":"none",transition:"transform 0.15s"}}>▼</span>
            </button>
            {compareDropOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:600,background:C.card,border:`1px solid ${C.border2}`,borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.13)",minWidth:260,overflow:"hidden"}}>
                {[{id:"none",label:"No comparison between periods"},{id:"prev",label:"Compare to previous period"}].map(opt=>(
                  <div key={opt.id} onClick={()=>{setCompareMode(opt.id);setCompareDropOpen(false);}}
                    style={{padding:"10px 14px",fontSize:12,cursor:"pointer",color:compareMode===opt.id?C.accent:C.text,fontWeight:compareMode===opt.id?600:400,background:compareMode===opt.id?C.accentBg:C.card,borderLeft:`3px solid ${compareMode===opt.id?C.accent:"transparent"}`}}
                    onMouseEnter={e=>{if(compareMode!==opt.id)e.currentTarget.style.background="#f9fafb";}}
                    onMouseLeave={e=>{if(compareMode!==opt.id)e.currentTarget.style.background=C.card;}}>
                    {opt.label}
                  </div>
                ))}
                <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:12,color:C.text,whiteSpace:"nowrap"}}>Compare to</span>
                  <button onClick={()=>setCompareVal(v=>Math.max(1,v-1))} style={{width:22,height:22,borderRadius:4,border:`1px solid ${C.border2}`,background:C.bg,cursor:"pointer",fontSize:13,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                  <span style={{fontSize:12,fontWeight:700,color:C.text,minWidth:16,textAlign:"center"}}>{compareVal}</span>
                  <button onClick={()=>setCompareVal(v=>v+1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${C.border2}`,background:C.bg,cursor:"pointer",fontSize:13,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                  <select value={compareUnit} onChange={e=>setCompareUnit(e.target.value)}
                    style={{padding:"4px 22px 4px 8px",borderRadius:5,border:`1px solid ${C.border2}`,fontSize:11,color:C.text,background:C.card,outline:"none",appearance:"none",cursor:"pointer",flex:1}}>
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                  <span style={{fontSize:12,color:C.text,whiteSpace:"nowrap"}}>earlier</span>
                  <button onClick={()=>{setCompareMode("relative");setCompareDropOpen(false);}}
                    style={{padding:"4px 10px",borderRadius:5,border:"none",background:C.accent,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>Apply</button>
                </div>
                <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:8}}>
                  <div onClick={()=>setCompareCustomExpanded(!compareCustomExpanded)} style={{fontSize:12,color:C.text,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{display:"inline-block",transform:compareCustomExpanded?"rotate(180deg)":"none",transition:"transform 0.15s"}}>▼</span>
                    Custom Date Comparison
                  </div>
                  {compareCustomExpanded&&(
                    <>
                      <div>
                        <div style={{fontSize:9,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:3}}>Start Date</div>
                        <input type="date" value={compareCustomStart} onChange={e=>setCompareCustomStart(e.target.value)}
                          style={{width:"100%",padding:"6px 8px",borderRadius:4,border:`1px solid ${C.border2}`,fontSize:11,color:C.text,outline:"none",boxSizing:"border-box"}}/>
                      </div>
                      {compareCustomStart&&(
                        <div style={{fontSize:10,color:C.muted}}>
                          Compares to: {new Date(compareCustomStart).toLocaleDateString()} - {new Date(new Date(compareCustomStart).getTime() + periodDays*24*60*60*1000).toLocaleDateString()}
                        </div>
                      )}
                      <button onClick={()=>{setCompareMode("custom");setCompareDropOpen(false);}}
                        disabled={!compareCustomStart}
                        style={{width:"100%",padding:"6px",borderRadius:5,border:"none",background:C.accent,color:"#fff",fontSize:11,fontWeight:600,cursor:!compareCustomStart?"not-allowed":"pointer",opacity:!compareCustomStart?0.4:1}}>
                        Apply Custom Comparison
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{marginLeft:"auto",display:"flex",background:C.bg,borderRadius:6,padding:2,gap:1,border:`1px solid ${C.border}`}}>
            {[{id:"line",icon:"📈",label:"Line chart"},{id:"bar",icon:"📊",label:"Bar chart"}].map(ct=>(
              <button key={ct.id} onClick={()=>setChartType(ct.id)}
                style={{padding:"4px 12px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:chartType===ct.id?600:400,background:chartType===ct.id?C.card:"transparent",color:chartType===ct.id?C.text:C.muted,boxShadow:chartType===ct.id?"0 1px 3px rgba(0,0,0,0.08)":"none",display:"flex",alignItems:"center",gap:4}}>
                {ct.icon} {ct.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:10,paddingLeft:PL}}>
          {seriesData.map(function(s){
            return(
              <Fragment key={s.id}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:20,height:2.5,borderRadius:2,background:s.color}}/>
                  <span style={{fontSize:11,color:C.text3}}>{evLabel(s.eventId)} <span style={{color:C.muted}}>Current</span></span>
                </div>
                {comparePrev&&(
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:20,height:2,borderRadius:2,background:s.color,opacity:0.4,borderTop:`2px dashed ${s.color}`}}/>
                    <span style={{fontSize:11,color:C.muted}}>{evLabel(s.eventId)} <span style={{color:C.muted}}>Previous</span></span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>

        <div ref={containerRef} style={{overflowX:"auto",position:"relative",minWidth:0}}>
          {chartType==="line"&&(
            <svg ref={svgRef} width={chartW} height={H} style={{display:"block",cursor:"crosshair"}}
              onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleSvgClick}>
              {yTicks.map(y=>(
                <g key={y}>
                  <line x1={PL} x2={chartW-PR} y1={yScale(y)} y2={yScale(y)} stroke={C.border} strokeDasharray="3 3"/>
                  <text x={PL-6} y={yScale(y)+4} textAnchor="end" fontSize={10} fill={C.muted}>{y>=1000?(y/1000).toFixed(y%1000===0?0:1)+"k":y}</text>
                </g>
              ))}
              {labels.map(function(l,i){
                if(i%every!==0&&i!==labels.length-1)return null;
                return <text key={i} x={xScale(i)} y={H-6} textAnchor="middle" fontSize={10} fill={C.muted}>{l.label}</text>;
              })}
              {seriesData.map(function(s){
                const pts=s.points.map((v,i)=>xScale(i)+","+yScale(v)).join(" ");
                const ppts=s.prev.map((v,i)=>xScale(i)+","+yScale(v)).join(" ");
                return(
                  <g key={s.id}>
                    {comparePrev&&<polyline points={ppts} fill="none" stroke={s.color} strokeWidth={1.5} strokeDasharray="5 3" opacity={0.45} strokeLinejoin="round" strokeLinecap="round"/>}
                    <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
                    {s.points.map((v,i)=>{
                      const hov=tooltip&&tooltip.idx===i;
                      return <circle key={i} cx={xScale(i)} cy={yScale(v)} r={hov?5:2.5} fill={s.color} stroke="#fff" strokeWidth={1.5}/>;
                    })}
                  </g>
                );
              })}

            </svg>
          )}
          {chartType==="bar"&&(
            <BarChart width={chartW} height={H} data={labels.map(function(l,i){
              const obj={label:l.label,fullLabel:l.fullLabel,dataIdx:i};
              seriesData.forEach(s=>{obj[s.id]=s.points[i];obj[s.id+"_prev"]=s.prev[i];});
              return obj;
            })} barCategoryGap="20%" margin={{top:PT,right:PR,bottom:0,left:PL-10}}>
              <XAxis dataKey="label" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?(v/1000).toFixed(1)+"k":v}/>
              <Tooltip content={({active,payload})=>{
                if(!active||!payload||!payload[0])return null;
                const dataIdx=payload[0].payload.dataIdx;
                return(
                  <div style={{background:C.card,borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.14)",border:`1px solid ${C.border}`,padding:"10px",maxWidth:450,maxHeight:300,overflowY:"auto"}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.text,paddingBottom:8,borderBottom:`1px solid ${C.border}`,marginBottom:10}}>{labels[dataIdx]&&labels[dataIdx].fullLabel}</div>
                    {comparePrev?(
                      <div style={{overflowX:"auto"}}>
                        <table style={{borderCollapse:"collapse",fontSize:11,minWidth:"100%"}}>
                          <thead>
                            <tr style={{borderBottom:`1px solid ${C.border}`}}>
                              <th style={{padding:"6px 8px",textAlign:"left",fontWeight:600,color:C.muted,whiteSpace:"nowrap"}}>Type</th>
                              {seriesData.map(s=>(
                                <th key={s.id} style={{padding:"6px 8px",textAlign:"right",fontWeight:600,color:C.text3,whiteSpace:"nowrap"}}>{evLabel(s.eventId)}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{padding:"6px 8px",fontWeight:600,color:C.text,whiteSpace:"nowrap"}}>Current</td>
                              {seriesData.map(s=>(
                                <td key={s.id} style={{padding:"6px 8px",textAlign:"right",color:C.text,fontWeight:600,color:s.color}}>{s.points[dataIdx]!=null?s.points[dataIdx].toLocaleString():"—"}</td>
                              ))}
                            </tr>
                            <tr>
                              <td style={{padding:"6px 8px",fontWeight:600,color:C.muted,whiteSpace:"nowrap"}}>Previous</td>
                              {seriesData.map(s=>(
                                <td key={s.id} style={{padding:"6px 8px",textAlign:"right",color:C.muted,fontWeight:600}}>{s.prev[dataIdx]!=null?s.prev[dataIdx].toLocaleString():"—"}</td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ):(
                      <div>
                        {seriesData.map(s=>(
                          <div key={s.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                            <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                            <span style={{fontSize:11,color:C.text3,flex:1}}>{evLabel(s.eventId)}</span>
                            <span style={{fontSize:12,fontWeight:700,color:s.color}}>{s.points[dataIdx]!=null?s.points[dataIdx].toLocaleString():"—"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}/>
              {seriesData.map(s=><Bar key={s.id} dataKey={s.id} name={evLabel(s.eventId)+" Current"} fill={s.color} radius={[2,2,0,0]} maxBarSize={28}/>)}
              {comparePrev&&seriesData.map(s=><Bar key={s.id+"_prev"} dataKey={s.id+"_prev"} name={evLabel(s.eventId)+" Prev"} fill={s.color} opacity={0.35} radius={[2,2,0,0]} maxBarSize={28}/>)}
            </BarChart>
          )}
          {(tooltip||pinnedTooltip)&&chartType==="line"&&(
            <div style={{position:"absolute",top:Math.max(0,(pinnedTooltip||tooltip).relY-10),left:(pinnedTooltip||tooltip).relX+16+280>chartW?(pinnedTooltip||tooltip).relX-290:(pinnedTooltip||tooltip).relX+12,zIndex:999,pointerEvents:pinnedTooltip?"auto":"none",background:C.card,borderRadius:8,boxShadow:"0 6px 24px rgba(0,0,0,0.14)",border:`1px solid ${C.border}`,padding:"10px",maxWidth:450,maxHeight:pinnedTooltip?300:"none",overflowY:pinnedTooltip?"auto":"visible"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.text}}>{labels[(pinnedTooltip||tooltip).idx]&&labels[(pinnedTooltip||tooltip).idx].fullLabel}</div>
                {pinnedTooltip&&<button onClick={closeTooltip} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.muted,padding:"0 4px",flexShrink:0,lineHeight:1}}>✕</button>}
              </div>
              {comparePrev?(
                <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",fontSize:11,minWidth:"100%"}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${C.border}`}}>
                        <th style={{padding:"6px 8px",textAlign:"left",fontWeight:600,color:C.muted,whiteSpace:"nowrap"}}>Type</th>
                        {seriesData.map(s=>(
                          <th key={s.id} style={{padding:"6px 8px",textAlign:"right",fontWeight:600,color:C.text3,whiteSpace:"nowrap"}}>{evLabel(s.eventId)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{padding:"6px 8px",fontWeight:600,color:C.text,whiteSpace:"nowrap"}}>Current</td>
                        {seriesData.map(s=>(
                          <td key={s.id} style={{padding:"6px 8px",textAlign:"right",color:C.text,fontWeight:600,color:s.color}}>{s.points[(pinnedTooltip||tooltip).idx]!=null?s.points[(pinnedTooltip||tooltip).idx].toLocaleString():"—"}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding:"6px 8px",fontWeight:600,color:C.muted,whiteSpace:"nowrap"}}>Previous</td>
                        {seriesData.map(s=>(
                          <td key={s.id} style={{padding:"6px 8px",textAlign:"right",color:C.muted,fontWeight:600}}>{s.prev[(pinnedTooltip||tooltip).idx]!=null?s.prev[(pinnedTooltip||tooltip).idx].toLocaleString():"—"}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              ):(
                <div>
                  {seriesData.map(s=>(
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                      <span style={{fontSize:11,color:C.text3,flex:1}}>{evLabel(s.eventId)}</span>
                      <span style={{fontSize:12,fontWeight:700,color:s.color}}>{s.points[(pinnedTooltip||tooltip).idx]!=null?s.points[(pinnedTooltip||tooltip).idx].toLocaleString():"—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>}

      {seriesList.length>0&&<Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,fontWeight:600,color:C.text}}>Detailed results</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{borderCollapse:"separate",borderSpacing:0,fontSize:12,whiteSpace:"nowrap",minWidth:"100%"}}>
            <thead>
              <tr style={{background:"#f9fafb"}}>
                <th style={{padding:"9px 18px",textAlign:"left",fontSize:11,fontWeight:600,color:C.muted,position:"sticky",left:0,background:"#f9fafb",zIndex:5,borderBottom:`1px solid ${C.border2}`,minWidth:220}}>Series</th>
                <th style={{padding:"9px 14px",textAlign:"right",fontSize:11,fontWeight:700,color:C.muted,borderBottom:`1px solid ${C.border2}`,minWidth:90}}>Total sum ↕</th>
                {tableLabels.map(function(l,i){
                  const cur=fmtColDate(l.date);
                  const prevDate=comparePrev?new Date(l.date.getTime()-prevOffsetMs):null;
                  const prev=prevDate?fmtColDate(prevDate):null;
                  return(
                    <th key={i} style={{padding:"8px 14px",textAlign:"right",fontSize:10,fontWeight:600,color:C.muted,borderBottom:`1px solid ${C.border2}`,minWidth:100}}>
                      <div style={{fontWeight:700,color:C.text3}}><span style={{color:C.muted,marginRight:3}}>{cur.day}</span>{cur.main}</div>
                      {prev&&<div style={{color:C.muted,marginTop:1}}>({prev.day} {prev.main})</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {seriesData.flatMap(function(s,si){
                const rows=[{label:"Current",points:s.points,alpha:1}];
                if(comparePrev)rows.push({label:"Previous",points:s.prev,alpha:0.5});
                return rows.map(function(row,ri){
                  const isLast=si===seriesData.length-1&&ri===rows.length-1;
                  const rowBg=si%2===0?(ri===0?C.card:"#f9fafb"):(ri===0?"#f9fafb":C.card);
                  return(
                    <tr key={s.id+row.label} style={{borderBottom:isLast?"none":`1px solid ${C.border}`}}>
                      <td style={{padding:"10px 18px",position:"sticky",left:0,background:rowBg,zIndex:2,borderBottom:`1px solid ${C.border}`}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:20,height:20,borderRadius:5,background:s.color,opacity:row.alpha,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {String.fromCharCode(65+si)}
                          </div>
                          <span style={{fontSize:12,fontWeight:600,color:C.text}}>{evLabel(s.eventId)}</span>
                          <span style={{fontSize:10,padding:"1px 6px",borderRadius:3,background:row.label==="Current"?C.accentBg:"#f3f4f6",color:row.label==="Current"?C.accent:C.muted,fontWeight:600}}>{row.label}</span>
                        </div>
                      </td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:700,color:C.text,borderBottom:`1px solid ${C.border}`,background:rowBg}}>
                        {row.points.reduce((a,b)=>a+b,0).toLocaleString()}
                      </td>
                      {tableLabels.map(function(l,i){return(
                        <td key={i} style={{padding:"10px 14px",textAlign:"right",color:C.text3,borderBottom:`1px solid ${C.border}`,background:rowBg}}>
                          {row.points[i]!=null?row.points[i].toLocaleString():"—"}
                        </td>
                      );})}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </Card>}
    </div>
  );
}

export default function App(){
  const [tab,setTab]=useState("funnel");
  const [lang,setLang]=useState("en");
  const [panelOpen,setPanelOpen]=useState(true);
  const [descriptions,setDescriptions]=useState({...DEFAULT_DESCRIPTIONS});
  const [focusPropKey,setFocusPropKey]=useState(null);
  const [globalCorrEv,setGlobalCorrEv]=useState(null);
  const [globalPropRow,setGlobalPropRow]=useState(null);
  const [globalPropMeta,setGlobalPropMeta]=useState(null);
  const initEnd=new Date();
  const initStart=new Date();initStart.setDate(initStart.getDate()-29);
  const [dateRange,setDateRange]=useState({label:"Last 30 days",days:30,startDate:initStart,endDate:initEnd});
  const dateCtx=useMemo(()=>({...dateRange,setRange:(r)=>{
    const days=r.days||daysBetween(r.startDate,r.endDate);
    setDateRange({...r,days});
  }}),[dateRange]);
  const labels={
    en:{appTitle:"VPN Analytics",appSubtitle:"Funnel · Events · Properties · Trends",tabFunnel:"Funnel Builder",tabEvents:"Event Definitions",tabProps:"Property Definitions",tabTrends:"Trends"},
    zh:{appTitle:"VPN 数据分析",appSubtitle:"漏斗 · 事件 · 属性 · 趋势",tabFunnel:"漏斗构建器",tabEvents:"事件定义",tabProps:"属性定义",tabTrends:"趋势"},
  };
  const tl=labels[lang];
  return (
    <DateRangeCtx.Provider value={dateCtx}>
    <LangCtx.Provider value={lang}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .recalc-fade{animation:fadeInUp 0.4s ease both}
      `}</style>
      <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",overflow:"hidden",position:"relative"}}>
        {globalCorrEv&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={e=>{if(e.target===e.currentTarget)setGlobalCorrEv(null);}}>
            <CorrModalPortal ev={globalCorrEv.ev} onClose={()=>setGlobalCorrEv(null)} lang={lang} result={globalCorrEv.result}/>
          </div>
        )}
        {globalPropRow&&globalPropMeta&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={e=>{if(e.target===e.currentTarget){setGlobalPropRow(null);setGlobalPropMeta(null);}}}>
            <PropCorrModal row={globalPropRow} lastStepLabel={globalPropMeta.lastStepLabel} totalUsers={globalPropMeta.totalUsers} convertedUsers={globalPropMeta.convertedUsers} onClose={()=>{setGlobalPropRow(null);setGlobalPropMeta(null);}}/>
          </div>
        )}
        <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"10px 24px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{width:30,height:30,borderRadius:7,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🛡</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{tl.appTitle}</div>
            <div style={{fontSize:10,color:C.muted}}>{tl.appSubtitle}</div>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",background:C.bg,borderRadius:6,padding:2,gap:1,border:`1px solid ${C.border}`}}>
            {[{id:"funnel",label:tl.tabFunnel},{id:"events",label:tl.tabEvents},{id:"properties",label:tl.tabProps},{id:"trends",label:tl.tabTrends}].map(function(tb){return(
              <button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"5px 16px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:tab===tb.id?600:400,background:tab===tb.id?C.card:"transparent",color:tab===tb.id?C.text:C.muted,boxShadow:tab===tb.id?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
                {tb.label}
              </button>
            );})}
          </div>
          <div style={{display:"flex",background:C.bg,borderRadius:6,padding:2,gap:1,border:`1px solid ${C.border}`}}>
            {["en","zh"].map(function(l){return(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"5px 10px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:lang===l?600:400,background:lang===l?C.card:"transparent",color:lang===l?C.text:C.muted,boxShadow:lang===l?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
                {l==="en"?"EN":"中文"}
              </button>
            );})}
          </div>
          <DateRangePicker/>
        </div>
        <div style={{flex:1,overflow:"hidden",display:"flex",minHeight:0}}>
          {tab==="funnel"&&<FunnelPage panelOpen={panelOpen} setPanel={setPanelOpen} setTab={setTab} descriptions={descriptions} setDescriptions={setDescriptions} setFocusPropKey={setFocusPropKey} setGlobalCorrEv={setGlobalCorrEv} setGlobalPropRow={setGlobalPropRow} setGlobalPropMeta={setGlobalPropMeta}/>}
          {tab==="events"&&<div style={{flex:1,overflowY:"auto",padding:"16px 20px 28px"}}><EventDefinitionsPage descriptions={descriptions} setDescriptions={setDescriptions}/></div>}
          {tab==="properties"&&<div style={{flex:1,overflowY:"auto",padding:"16px 20px 28px"}}><PropertyDefinitionsPage focusPropKey={focusPropKey} setFocusPropKey={setFocusPropKey}/></div>}
          {tab==="trends"&&<div style={{flex:1,overflowY:"auto",padding:"16px 20px 28px"}}><TrendsPage lang={lang} dateRange={dateRange}/></div>}
        </div>
      </div>
    </LangCtx.Provider>
    </DateRangeCtx.Provider>
  );
}