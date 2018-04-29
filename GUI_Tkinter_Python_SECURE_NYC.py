from Tkinter import *
from PIL import ImageTk,Image
from pexpect import pxssh
import multiprocessing 
import os

root = Tk()

class SSH:
	def __init__(self, master):
		self.master=master
		master.title('SSH Test')
		jobs=[]

		self.logo=Label(master, text='SECURE NYC',font=('Rockwell Extra Bold',64),fg='#124081')

		self.connect=Button(master, text="Connect", command=self.multiprocess)
		self.display_text=StringVar()
		self.display_text.set("")
		self.display=Message(master,textvariable=self.display_text)
		self.print_conversation=Button(master,text="Print",command=self.print_conversation)
		#self.test1=Button(master, text="Click me too!",command=self.test1)
		self.kill=Button(master,text="Disconnect",command=self.kill_all_processes, state=DISABLED)
		self.quit=Button(master,text="Close",command=master.quit)

		#LAYOUT
		self.logo.grid(columnspan=4)
		self.connect.grid(row=1, column=0, columnspan=2)
		self.kill.grid(row=2,column=0,columnspan=2)
		self.print_conversation.grid(row=1,column=2,columnspan=2)
		#self.test1.grid(row=2,column=2,columnspan=2)
		self.display.grid(row=3,columnspan=4, sticky=N+W)
		master.rowconfigure(3,minsize=400)
		self.quit.grid(row=4,column=3,pady=(0,20))


	def multiprocess(self):
		p = multiprocessing.Process(target=self.connect_to_SSH)
		p.start()

		self.connect['state']=DISABLED
		self.kill['state']=NORMAL
		print "hey, something worked!"

	def connect_to_SSH(self):
		print "even MORE worked!"
		s = pxssh.pxssh( timeout=None, ignore_sighup=True)
		fout=open('my_log.txt','w')
		s.logfile_read=fout
		#s.logfile_read=sys.stdout
		if not s.login ('egor.semeniak.net', 'egor', password='Lego1997',port='10022'):
		    print "SSH session failed on login."
		    print str(s)
		else:
		    print "SSH session login successful"
		    s.sendline ('cd chatbot')
		    s.prompt()
		    s.sendline ('node test_code.js')
		    s.prompt()         # match the prompt
		    #print s.before     # print everything before the prompt.
		    #s.logout()
		fout.close()
		fin=open('my_log.txt','r')
		for line in fin:
			self.display_text.set(self.display_text.get()+line)
		fin.close()

	def kill_all_processes(self):
		s = pxssh.pxssh( timeout=None, ignore_sighup=True)
		s.logfile_read=sys.stdout
		if not s.login ('egor.semeniak.net', 'egor', password='Lego1997',port='10022'):
		    print "SSH session failed on login."
		    print str(s)
		else:
		    print "SSH session login successful"
		    s.sendline ('killall node')
		    s.prompt()
		self.kill['state']=DISABLED
		self.connect['state']=NORMAL
		


	def print_conversation(self):
		self.clearLabel()
		fin=open('my_log.txt','r')
		print_response=0
		for line in fin:
			if line.startswith("Recieved") or print_response==1:
				self.display_text.set(self.display_text.get()+line)
				print_response=1 if print_response==0 else 0
		fin.close()

	#def test1(self):
	#	self.display_text.set("This button doesn't do anything.")

	def clearLabel(self):
		self.display_text.set("")


my_gui = SSH(root)
root.mainloop()