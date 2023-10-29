"use client";

import { useModal } from "@/hooks/use-modal-store";
import qs from "query-string";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";



export const DeleteMessageModal = () => {

  const [isLoading, setIsLoading] = useState(false)

  const { type, isOpen, onClose, data } = useModal()

  const { apiUrl, query } = data

  const router = useRouter()


  const isModalOpen = isOpen && type === 'deleteMessage'

  

  const onDelete = async () => {

    try {
        const url = qs.stringifyUrl({
            url: apiUrl || "",
            query: query              
          });
    
          await axios.delete(url);
          onClose()
        
    } catch (error) {
        console.log(error)
    }
}



  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Message
          </DialogTitle>

          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this message? 
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="bg-gray-100 px-6 py-4">

          <div className="flex items-center justify-between w-full">

            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>

            <Button disabled={isLoading} onClick={onDelete} variant="primary">
              Confirm
            </Button>


          </div>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}