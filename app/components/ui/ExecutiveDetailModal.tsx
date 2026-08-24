"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./ExecutiveDetailModal.module.css";

type Props={eyebrow?:string;title:string;summary:string;triggerLabel?:string;children:ReactNode;actionHref?:string;actionLabel?:string};
export default function ExecutiveDetailModal({eyebrow,title,summary,triggerLabel="View details",children,actionHref,actionLabel="More information"}:Props){
 const [open,setOpen]=useState(false);const titleId=useId();const triggerRef=useRef<HTMLButtonElement>(null);const dialogRef=useRef<HTMLElement>(null);const closeRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow="hidden";closeRef.current?.focus();const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);return}if(e.key!=="Tab"||!dialogRef.current)return;const f=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'));if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};window.addEventListener("keydown",onKey);return()=>{document.body.style.overflow=old;window.removeEventListener("keydown",onKey);triggerRef.current?.focus()}},[open]);
 const modal=open&&typeof document!=="undefined"?createPortal(<div className={styles.backdrop} onMouseDown={()=>setOpen(false)}><section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={e=>e.stopPropagation()}><header className={styles.header}><div>{eyebrow?<p>{eyebrow}</p>:null}<h2 id={titleId}>{title}</h2><span>{summary}</span></div><button ref={closeRef} type="button" onClick={()=>setOpen(false)} aria-label="Close details">×</button></header><div className={styles.content}>{children}</div><footer className={styles.footer}>{actionHref?<Link href={actionHref}>{actionLabel}</Link>:null}<button type="button" onClick={()=>setOpen(false)}>Close</button></footer></section></div>,document.body):null;
 return <><button ref={triggerRef} type="button" className={styles.trigger} onClick={()=>setOpen(true)}>{eyebrow?<span className={styles.eyebrow}>{eyebrow}</span>:null}<strong>{title}</strong><span className={styles.summary}>{summary}</span><span className={styles.action}>{triggerLabel} <b aria-hidden="true">→</b></span></button>{modal}</>;
}
